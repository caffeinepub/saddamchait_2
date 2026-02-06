import { useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useCamera } from '@/camera/useCamera';
import { processProfileImage, type ProcessedImage } from '@/lib/profileImageProcessing';
import { signUpWithEmail } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrorMessages';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: (redirectTo: '/chat' | '/pending-approval') => void;
}

export default function SignupScreen({ onNavigateToLogin, onSignupSuccess }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<ProcessedImage | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: isCameraLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    width: 1280,
    height: 720,
    quality: 0.9,
    format: 'image/jpeg',
  });

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrors((prev) => ({ ...prev, profileImage: '' }));

    const processed = await processProfileImage(file);
    setProfileImage(processed);
    setIsProcessingImage(false);

    if (!processed.isValid && processed.error) {
      setErrors((prev) => ({ ...prev, profileImage: processed.error! }));
    }
  };

  const handleCameraClick = async () => {
    setShowCamera(true);
    setErrors((prev) => ({ ...prev, profileImage: '' }));
    await startCamera();
  };

  const handleCapturePhoto = async () => {
    const file = await capturePhoto();
    if (file) {
      setIsProcessingImage(true);
      const processed = await processProfileImage(file);
      setProfileImage(processed);
      setIsProcessingImage(false);

      if (!processed.isValid && processed.error) {
        setErrors((prev) => ({ ...prev, profileImage: processed.error! }));
      }

      await stopCamera();
      setShowCamera(false);
    }
  };

  const handleCancelCamera = async () => {
    await stopCamera();
    setShowCamera(false);
  };

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setErrors((prev) => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileImage) {
      newErrors.profileImage = 'Profile photo is required';
    } else if (!profileImage.isValid) {
      newErrors.profileImage = profileImage.error || 'Invalid profile photo';
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await signUpWithEmail(email, password, {
        name,
        photoURL: profileImage?.dataUrl || '',
      });

      if (result.success) {
        // Redirect based on whether this was the first user
        if (result.isFirstUser) {
          console.log('SignupScreen - First user (super_admin, approved), redirecting to /chat');
          onSignupSuccess('/chat');
        } else {
          console.log('SignupScreen - Not first user, redirecting to /pending-approval');
          onSignupSuccess('/pending-approval');
        }
      } else if (result.error) {
        const errorMessage = getFirebaseErrorMessage(result.error);
        
        if (result.isProfileError) {
          setErrors({ 
            submit: `${errorMessage} Your account was created but profile setup failed. Please contact support.` 
          });
        } else {
          setErrors({ submit: errorMessage });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera) {
    return (
      <AuthLayout>
        <div className="w-full space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Capture Profile Photo</h1>
            <p className="text-sm text-muted-foreground">
              Position your face in the frame and capture
            </p>
          </div>

          <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError.message}</AlertDescription>
            </Alert>
          )}

          {isSupported === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Camera is not supported on this device</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelCamera}
              className="flex-1"
              disabled={isCameraLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSwitchCamera}
              variant="outline"
              disabled={isCameraLoading || !isActive}
              className="flex-1"
            >
              Switch ({currentFacingMode === 'user' ? 'Front' : 'Back'})
            </Button>
            <Button
              type="button"
              onClick={handleCapturePhoto}
              disabled={!isActive || isCameraLoading}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Saddam Chat</h1>
          <p className="text-sm text-muted-foreground">
            Create your account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Profile Photo *</Label>
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of yourself
            </p>

            {profileImage ? (
              <div className="relative">
                <div className="relative aspect-square w-32 overflow-hidden rounded-lg border-2 border-primary">
                  <img
                    src={profileImage.dataUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Size: {profileImage.sizeKB.toFixed(1)}KB
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGalleryClick}
                  disabled={isProcessingImage}
                  className="flex-1"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Gallery
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  disabled={isProcessingImage}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isProcessingImage && (
              <p className="text-xs text-muted-foreground">Processing image...</p>
            )}

            {errors.profileImage && (
              <p className="text-xs text-destructive">{errors.profileImage}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Signup'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-medium text-primary hover:underline focus:outline-none focus:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
