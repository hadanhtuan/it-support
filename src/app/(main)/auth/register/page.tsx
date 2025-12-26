'use client';

import { CheckYourEmail } from '@/components/auth/check-your-email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/context/auth-context';
import { Collection, SignInMethod, User, UserRole, UserStatus } from '@/lib/core/models';
import { userRegistrationSchema, itSupportRegistrationSchema } from '@/lib/core/validations/auth';
import { firebaseAuth } from '@/lib/firebase/client/client-config';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { toast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { authService } from '@/services';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { z } from 'zod';

export default function RegisterPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    zaloId: ''
  });
  const router = useRouter();
  const { refreshUser } = useAuth();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const createUser = async (user: Partial<User>): Promise<string> =>
    FirestoreClientHelper.createDocument(
      Collection.USERS,
      {
        ...user,
        createdAt: Timestamp.fromDate(new Date()),
        rating: 0
      },
      user.uid
    );

  const validateForm = (): boolean => {
    try {
      const schema = userRole === UserRole.USER ? userRegistrationSchema : itSupportRegistrationSchema;
      const dataToValidate = {
        ...formData,
        role: userRole
      };

      schema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const isEmailValid = await authService.isEmailValid(formData.email);

      if (!isEmailValid) {
        setErrors((prev) => ({ ...prev, email: t('auth.emailExists') }));
        setIsLoading(false);
        return;
      }

      // Store a flag in sessionStorage to indicate we're in registration flow
      sessionStorage.setItem('registering', 'true');

      // create user in firebase auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );

      const user: Partial<User> = {
        email: formData.email,
        fullname: formData.fullname,
        role: userRole,
        uid: userCredential.user.uid,
        id: userCredential.user.uid,
        signInMethod: SignInMethod.EMAIL_PASSWORD,
        status: UserStatus.ACTIVE
      };

      // Send email verification using Firebase client SDK
      const subRoute = userRole === UserRole.IT_SUPPORT ? 'it-support' : 'user';
      const actionCodeSettings = {
        url: `${window.location.origin}/${subRoute}/update-profile?role=${userRole}`,
        handleCodeInApp: true
      };

      // Send verification email - Firebase handles the email sending automatically
      await sendEmailVerification(userCredential.user, actionCodeSettings);

      // Create user in Firestore
      await createUser(user);

      // Clear the registration flag
      sessionStorage.removeItem('registering');

      toast({
        title: t('auth.registrationSuccessful'),
        description: t('auth.accountCreatedCheckYourEmail'),
        variant: 'success'
      });

      await refreshUser();

      // Now navigate after everything is complete
      router.push('/');
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors((prev) => ({
        ...prev,
        general: t('auth.registrationError')
      }));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);

    // Set flag before any auth operations to prevent route guard interference
    sessionStorage.setItem('registering', 'true');

    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(firebaseAuth, googleProvider);

      // Extract user info from Google account
      const { user } = userCredential;
      const fullname = user.displayName || '';
      const email = user.email || '';

      // Check if email already exists
      const isEmailValid = await authService.isEmailValid(email);

      if (!isEmailValid) {
        // User already exists - let them sign in but show error toast
        toast({
          title: t('auth.emailExists'),
          description: t('auth.accountExistsGoogle'),
          variant: 'destructive'
        });

        // Clear the registration flag and proceed to main page
        sessionStorage.removeItem('registering');
        router.push('/');
        return;
      }

      // Register user with extracted Google account info
      const status = userRole === UserRole.USER ? UserStatus.ACTIVE : UserStatus.INACTIVE;

      const newUser: Partial<User> = {
        email,
        fullname,
        role: userRole,
        uid: user.uid,
        signInMethod: SignInMethod.GOOGLE,
        status
      };
      await createUser(newUser);

      // Clear the registration flag
      sessionStorage.removeItem('registering');

      toast({
        title: t('auth.registrationSuccessful'),
        description: t('auth.accountCreated'),
        variant: 'success'
      });
      await refreshUser();

      router.push('/');
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      // Clear the registration flag on error
      sessionStorage.removeItem('registering');

      // Handle specific error types
      if (error.code === 'auth/popup-closed-by-user') {
        // User canceled, don't show error
      } else {
        setErrors((prev) => ({
          ...prev,
          general: t('auth.googleSignInError')
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // // If registration is completed, show CheckYourEmail component
  // if (isSubmitted && registrationEmail) {
  //   const handleBackToRegistration = (): void => {
  //     setIsSubmitted(false);
  //     setRegistrationEmail('');
  //   };

  //   const handleContinueToApp = (): void => {
  //     router.push('/');
  //   };

  //   return (
  //     <CheckYourEmail email={registrationEmail} onBack={handleBackToRegistration} onContinue={handleContinueToApp} />
  //   );
  // }

  // If loading and not submitted, you might want to show a loading state
  // but since we're handling this in the button, we'll proceed with the form

  return (
    <div className='container max-w-md py-12'>
      <div className='space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>{t('auth.createAccount')}</h1>
          <p className='text-muted-foreground'>{t('auth.joinGroupTutor')}</p>
        </div>

        <Tabs defaultValue={UserRole.USER} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value={UserRole.USER} onClick={() => setUserRole(UserRole.USER)}>
              {t('auth.user')}
            </TabsTrigger>
            <TabsTrigger value={UserRole.IT_SUPPORT} onClick={() => setUserRole(UserRole.IT_SUPPORT)}>
              {t('auth.itSupport')}
            </TabsTrigger>
          </TabsList>

          {/* User tab content */}
          <TabsContent value={UserRole.USER}>
            <form className='space-y-4'>
              {/* Form fields remain the same */}
              <div className='space-y-2'>
                <Label htmlFor='fullname'>{t('auth.fullName')} *</Label>
                <Input
                  id='fullname'
                  name='fullname'
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className={errors.fullname ? 'border-red-500' : ''}
                />
                {errors.fullname && <p className='text-sm text-red-500'>{errors.fullname}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>{t('auth.email')} *</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='zaloId'>{t('auth.zaloId')}</Label>
                <Input
                  id='zaloId'
                  name='zaloId'
                  placeholder={t('auth.zaloIdPlaceholder')}
                  value={formData.zaloId}
                  onChange={handleInputChange}
                  className={errors.zaloId ? 'border-red-500' : ''}
                />
                {errors.zaloId && <p className='text-sm text-red-500'>{errors.zaloId}</p>}
                <p className='text-xs text-muted-foreground'>{t('auth.zaloIdHelp')}</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>{t('auth.password')} *</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>{t('auth.confirmPassword')} *</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword}</p>}
              </div>

              <Button type='button' className='w-full' disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? t('common.creating') : t('auth.createUserAccount')}
              </Button>
            </form>
          </TabsContent>

          {/* IT Support tab content */}
          <TabsContent value={UserRole.IT_SUPPORT}>
            <form className='space-y-4'>
              {/* Form fields remain the same */}
              <div className='space-y-2'>
                <Label htmlFor='it-support-fullname'>{t('auth.fullName')} *</Label>
                <Input
                  id='it-support-fullname'
                  name='fullname'
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className={errors.fullname ? 'border-red-500' : ''}
                />
                {errors.fullname && <p className='text-sm text-red-500'>{errors.fullname}</p>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='it-support-email'>{t('auth.email')} *</Label>
                <Input
                  id='it-support-email'
                  name='email'
                  type='email'
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='it-support-zaloId'>{t('auth.zaloId')}</Label>
                <Input
                  id='it-support-zaloId'
                  name='zaloId'
                  placeholder={t('auth.zaloIdPlaceholder')}
                  value={formData.zaloId}
                  onChange={handleInputChange}
                  className={errors.zaloId ? 'border-red-500' : ''}
                />
                {errors.zaloId && <p className='text-sm text-red-500'>{errors.zaloId}</p>}
                <p className='text-xs text-muted-foreground'>{t('auth.zaloIdHelp')}</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='it-support-password'>{t('auth.password')} *</Label>
                <Input
                  id='it-support-password'
                  name='password'
                  type='password'
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='it-support-confirmPassword'>{t('auth.confirmPassword')} *</Label>
                <Input
                  id='it-support-confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword}</p>}
              </div>

              <Button type='button' className='w-full' disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? t('common.creating') : t('auth.createITSupportAccount')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {errors.general && <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>{errors.general}</div>}

        <Separator />

        <div className='space-y-4'>
          <Button variant='outline' className='w-full' onClick={handleGoogleSignIn} disabled={isLoading} type='button'>
            <Mail className='mr-2 h-4 w-4' />
            {isLoading ? t('auth.connecting') : t('auth.continueWithGoogle')}
          </Button>
        </div>

        <div className='text-center text-sm'>
          {t('auth.alreadyHaveAccountQuestion')}{' '}
          <Link href='/auth/login' className='font-medium text-primary hover:underline'>
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
