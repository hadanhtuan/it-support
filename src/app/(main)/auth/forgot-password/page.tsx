'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Collection, SignInMethod, User } from '@/lib/core/models';
import { ForgotPasswordForm, forgotPasswordSchema } from '@/lib/core/validations/forgot-password';
import { firebaseAuth } from '@/lib/firebase/client/client-config';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ForgotPasswordPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordForm): Promise<void> => {
    setIsLoading(true);

    try {
      const user: User | null = await FirestoreClientHelper.getOne(Collection.USERS, [
        { field: 'email', op: '==', value: data.email }
      ]);
      if (user && user.signInMethod !== SignInMethod.EMAIL_PASSWORD) {
        throw new Error(t('auth.differentSignInMethod'));
      }

      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false
      };

      // Send password reset email using Firebase client SDK
      // Firebase automatically sends the email using its built-in templates
      await sendPasswordResetEmail(firebaseAuth, data.email, actionCodeSettings);

      setIsSuccess(true);
      toast({
        title: t('auth.resetEmailSentTitle'),
        description: t('auth.resetEmailSentDescription')
      });

      form.reset();
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: t('auth.errorSendingReset'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <Card>
            <CardHeader className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100'>
                <Mail className='h-6 w-6 text-green-600' />
              </div>
              <CardTitle className='text-2xl font-bold'>{t('auth.checkEmail')}</CardTitle>
              <CardDescription>{t('auth.resetEmailSent')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-sm text-muted-foreground text-center'>
                <p>{t('auth.didntReceiveEmail')}</p>
                <Button variant='link' className='p-0 h-auto font-normal' onClick={() => setIsSuccess(false)}>
                  {t('auth.tryAgain')}
                </Button>
              </div>
              <div className='text-center'>
                <Link href='/auth/login'>
                  <Button variant='outline' className='w-full'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    {t('auth.backToLogin')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100'>
              <Lock className='h-6 w-6 text-blue-600' />
            </div>
            <CardTitle className='text-2xl font-bold'>{t('auth.forgotPasswordPage')}</CardTitle>
            <CardDescription>{t('auth.forgotPasswordDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.emailAddress')}</FormLabel>
                      <FormControl>
                        <Input {...field} type='email' placeholder={t('auth.enterEmailAddress')} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? t('auth.sendingReset') : t('auth.sendResetEmail')}
                </Button>
              </form>
            </Form>

            <div className='mt-6 text-center'>
              <Link href='/auth/login'>
                <Button variant='link' className='text-sm'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
