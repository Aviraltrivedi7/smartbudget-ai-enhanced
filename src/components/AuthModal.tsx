import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  // Form states
  const [signinForm, setSigninForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [resetEmail, setResetEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(signinForm.email, signinForm.password);
    
    if (!error) {
      onClose();
      setSigninForm({ email: '', password: '' });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      return; // Handle password mismatch
    }
    
    setLoading(true);
    
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
    
    if (!error) {
      setActiveTab('signin');
      setSignupForm({ email: '', password: '', fullName: '', confirmPassword: '' });
    }
    
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await resetPassword(resetEmail);
    setResetEmail('');
    
    setLoading(false);
  };

  const isHindi = currentLanguage === 'hi';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-xl">SmartBudget AI</span>
            </div>
            {isHindi ? 'अपने खाते में प्रवेश करें' : 'Welcome Back!'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">
              {isHindi ? 'लॉगिन' : 'Sign In'}
            </TabsTrigger>
            <TabsTrigger value="signup">
              {isHindi ? 'साइन अप' : 'Sign Up'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader className="space-y-1">
                <CardDescription className="text-center">
                  {isHindi 
                    ? 'अपनी जानकारी दर्ज करें'
                    : 'Enter your credentials to access your account'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'ईमेल' : 'Email'}
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={isHindi ? 'आपका ईमेल' : 'your@email.com'}
                      value={signinForm.email}
                      onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">
                      <Lock className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'पासवर्ड' : 'Password'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isHindi ? 'आपका पासवर्ड' : 'Your password'}
                        value={signinForm.password}
                        onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isHindi ? 'साइन इन करें' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => setActiveTab('reset')}
                  >
                    {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1">
                <CardDescription className="text-center">
                  {isHindi 
                    ? 'अपना नया खाता बनाएं'
                    : 'Create your new account'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">
                      <User className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'पूरा नाम' : 'Full Name'}
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={isHindi ? 'आपका पूरा नाम' : 'Your full name'}
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'ईमेल' : 'Email'}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={isHindi ? 'आपका ईमेल' : 'your@email.com'}
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">
                      <Lock className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'पासवर्ड' : 'Password'}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={isHindi ? 'कम से कम 6 अक्षर' : 'At least 6 characters'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">
                      <Lock className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={isHindi ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter password'}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isHindi ? 'खाता बनाएं' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reset">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-center">
                  {isHindi ? 'पासवर्ड रीसेट करें' : 'Reset Password'}
                </CardTitle>
                <CardDescription className="text-center">
                  {isHindi 
                    ? 'अपना ईमेल दर्ज करें, हम आपको रीसेट लिंक भेजेंगे'
                    : 'Enter your email and we\'ll send you a reset link'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {isHindi ? 'ईमेल' : 'Email'}
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder={isHindi ? 'आपका ईमेल' : 'your@email.com'}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isHindi ? 'रीसेट लिंक भेजें' : 'Send Reset Link'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => setActiveTab('signin')}
                  >
                    {isHindi ? 'वापस साइन इन पर जाएं' : 'Back to Sign In'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-gray-500 mt-4">
          {isHindi 
            ? 'ऑफलाइन मोड के लिए बस ऐप का उपयोग शुरू करें'
            : 'Just start using the app for offline mode'
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;