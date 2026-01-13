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
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
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
        '&.Mui-focused fieldset': { borderColor: '#1e3a8a' },
        '& fieldset': { borderColor: '#e6eef8' },
        fontSize: '0.95rem',
      },
      '& .MuiInputLabel-root': { fontSize: '0.9rem', color: '#374151' },
    },
  };

  return (
    <>
      {/* Logo */}
      <Box textAlign="center" mb={3}>
        <Box
            sx={{
              width: 52,
              height: 52,
              mx: 'auto',
              mb: 1.5,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
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
        >
         SMMP FacilityPro
        </Typography>
      </Box>

      {/* Heading */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to manage your facilities
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword(!showPassword)}
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
          Don’t have an account?{' '}
          <Link href="/register" fontWeight={600}>
            Sign up
          </Link>
        </Typography>
      </Box>

      <Box textAlign="center" mt={4}>
              <Typography variant="caption" color="text.secondary">
                © 2024 FacilityPro. All rights reserved.
              </Typography>
              <Box mt={1} display="flex" justifyContent="center" gap={2}>
                <Link variant="caption" href="/terms">Terms of Service</Link>
                <Link variant="caption" href="/privacy">Privacy Policy</Link>
              </Box>
            </Box>
    </>
  );
};

export default Login;
