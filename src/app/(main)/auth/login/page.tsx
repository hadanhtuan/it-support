'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/context';
import { Collection, User, UserRole, UserStatus } from '@/lib/core/models';
import { loginSchema } from '@/lib/core/validations/auth';
import { firebaseAuth } from '@/lib/firebase/client/client-config';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { z } from 'zod';

export default function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const validateForm = (): boolean => {
    try {
      const schema = loginSchema;
      const dataToValidate = {
        ...formData
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

  // const { userState } = useAuth(); // Check auth state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Validate user before login
      const user: User | null = await FirestoreClientHelper.getOne(Collection.USERS, [
        { field: 'email', op: '==', value: formData.email }
      ]);

      if (!user) {
        setIsLoading(false);
        setErrors({
          email: t('auth.userNotFound'),
          password: t('auth.userNotFound')
        });
        return;
      }

      if (user.status === UserStatus.BLOCKED) {
        setIsLoading(false);
        setErrors({
          email: t('auth.accountBlockedMessage'),
          password: t('auth.accountBlockedMessage')
        });
        toast({
          title: t('auth.accountBlocked'),
          description: t('auth.accountBlockedMessage'),
          duration: 3000
        });
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password);

      // await authService.setCustomClaim(userCredential.user.uid, user.role, user.status);
      toast({
        title: t('auth.loginSuccessful'),
        description: t('auth.welcomeBackMessage'),
        duration: 3000
      });
      if (user.role === UserRole.ADMIN) {
        router.push('/admin'); // Redirect admin to dashboard
        return;
      }
      setIsLoading(false);

      router.push('/'); // Redirect to home after successful login
    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        title: t('auth.wrongCredentials'),
        description: t('auth.checkEmailPassword'),
        duration: 3000
      });

      setErrors({
        email: t('auth.invalidEmailPassword'),
        password: t('auth.invalidEmailPassword')
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(firebaseAuth, googleProvider);

      // Extract user info from Google account
      const { user } = userCredential;
      const email = user.email || '';

      // Check if user exists in our database
      const existingUser: User | null = await FirestoreClientHelper.getOne(Collection.USERS, [
        { field: 'email', op: '==', value: email }
      ]);

      if (existingUser) {
        if (existingUser.status === UserStatus.BLOCKED) {
          setIsLoading(false);
          setErrors({
            email: t('auth.accountBlockedMessage'),
            password: t('auth.accountBlockedMessage')
          });
          toast({
            title: t('auth.accountBlocked'),
            description: t('auth.accountBlockedMessage'),
            duration: 3000
          });
          logout(); // Log out the user if blocked
          return;
        }

        // User exists, set custom claim and redirect to home
        // await authService.setCustomClaim(user.uid, existingUser.role, existingUser.status);
        // await refreshToken();
        router.push('/');

        toast({
          title: t('auth.loginSuccessful'),
          description: t('auth.welcomeBackMessage'),
          duration: 3000,
          variant: 'success'
        });
      } else {
        // User doesn't exist, redirect to register
        toast({
          title: t('auth.accountNotFound'),
          description: t('auth.pleaseRegisterFirst'),
          duration: 3000
        });

        router.push('/auth/register');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      // Handle specific error types
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: t('auth.signInCanceled'),
          description: t('auth.googleSignInClosed'),
          duration: 3000
        });
      } else {
        toast({
          title: t('auth.loginFailed'),
          description: t('auth.googleSignInError'),
          duration: 3000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className='container max-w-md py-12'>
      <div className='space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>{t('auth.welcomeBack')}</h1>
          <p className='text-muted-foreground'>{t('auth.signInToAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>{t('auth.email')}</Label>
            <Input
              id='email'
              type='email'
              name='email'
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleInputChange}
              required
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>{t('auth.password')}</Label>
              <Link href='/auth/forgot-password' className='text-sm font-medium text-primary hover:underline'>
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                required
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <Separator />

        <div className='space-y-4'>
          <Button variant='outline' className='w-full' onClick={handleGoogleSignIn} disabled={isLoading} type='button'>
            <Mail className='mr-2 h-4 w-4' />
            {isLoading ? t('auth.connecting') : t('auth.continueWithGoogle')}
          </Button>
        </div>

        <div className='text-center text-sm'>
          {t('auth.dontHaveAccount')}{' '}
          <Link href='/auth/register' className='font-medium text-primary hover:underline'>
            {t('auth.signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
