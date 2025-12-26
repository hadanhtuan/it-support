import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface CheckYourEmailProps {
  email: string;
  onBack?: () => void;
  onContinue?: () => void;
}

export function CheckYourEmail({ email, onBack, onContinue }: CheckYourEmailProps): React.JSX.Element {
  return (
    <div className='container max-w-md py-12'>
      <Card>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>We`ve sent a verification link to {email}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-lg bg-muted p-4'>
            <div className='flex items-center gap-3'>
              <Mail className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>Verification Email Sent</p>
                <p className='text-xs text-muted-foreground'>
                  Click the link in your email to complete your registration. After verification, you&apos;ll be
                  redirected to the main application.
                </p>
              </div>
            </div>
          </div>

          {onBack && (
            <div className='pt-4 border-t space-y-2'>
              <Button variant='outline' onClick={onBack} className='w-full'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Registration
              </Button>
              {onContinue && (
                <Button onClick={onContinue} className='w-full'>
                  Continue to App
                </Button>
              )}
            </div>
          )}

          {/* <div className='text-center text-sm text-muted-foreground'>
                  <p>Didn`t receive the email? Check your spam folder or</p>
                  <Button variant='link' className='p-0 h-auto' onClick={() => setIsSubmitted(false)}>
                    try again
                  </Button>
                </div> */}

          {/* Simulate email link for demo purposes */}
          {/* <div className='pt-4 border-t'>
                  <p className='text-xs text-muted-foreground mb-2'>For demo purposes, click here:</p>
                  <Button asChild className='w-full'>
                    <Link href='/auth/more-info'>Complete Registration</Link>
                  </Button>
                </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
