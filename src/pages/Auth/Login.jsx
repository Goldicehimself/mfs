import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { ArrowLeft, Eye, EyeOff, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password.');
    }
  };

  const fieldProps = {
    variant: 'outlined',
    fullWidth: true,
    size: 'small',
    margin: 'normal',
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 1,
        backgroundColor: '#f8fafc',
        '&.Mui-focused fieldset': { borderColor: 'var(--mp-brand)' },
        '& fieldset': { borderColor: '#e6eef8' },
        fontSize: '0.95rem',
      },
      '& .MuiInputLabel-root': { fontSize: '0.9rem', color: '#374151' },
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 2,
        }}
      >
        {/* Logo (click to return to landing) */}
        <Box textAlign="center" mb={3}>
          <Link component={RouterLink} to="/" underline="none" sx={{ display: 'inline-block', color: 'inherit' }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                mx: 'auto',
                mb: 1.5,
                borderRadius: 1.5,
                bgcolor: 'var(--mp-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 9, ease: 'linear', repeat: Infinity }}
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: 'center' }}
              >
                <Wrench size={26} color="#fff" />
              </motion.div>
            </Box>

            <Typography
              variant="h6"
              fontWeight={700}
              letterSpacing="-0.3px"
              sx={{ textAlign: 'center' }}
            >
              FacilityPro
            </Typography>
          </Link>
        </Box>

        {/* Heading */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage your facilities
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            <Link component={RouterLink} to="/" underline="hover" sx={{ color: 'var(--mp-brand)', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowLeft size={14} />
              Back to home
            </Link>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
              {...fieldProps}
              label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
              {...fieldProps}
              label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Options */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 1,
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Remember me
                </Typography>
              }
            />

            <Link
              href="/forgot-password"
              variant="body2"
              underline="hover"
              sx={{ color: 'var(--mp-brand)', '&:hover': { color: 'var(--mp-brand-dark)', textDecoration: 'underline' } }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            sx={{
              mt: 1,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'var(--mp-brand)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'var(--mp-brand-dark)',
              },
            }}
          >
            Sign in
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={3}
          >
            Don't have an account?{' '}
            <Link href="/register" fontWeight={600} sx={{ color: 'var(--mp-brand)', '&:hover': { color: 'var(--mp-brand-dark)' } }}>
              Sign up
            </Link>
          </Typography>
        </Box>

        <Box textAlign="center" mt={4}>
                <Typography variant="caption" color="text.secondary">
                  (c) 2024 FacilityPro. All rights reserved.
                </Typography>
                <Box mt={1} display="flex" justifyContent="center" gap={2}>
                  <Link variant="caption" href="/terms">Terms of Service</Link>
                  <Link variant="caption" href="/privacy">Privacy Policy</Link>
                </Box>
              </Box>
      </Paper>
    </Box>
  );
};

export default Login;
