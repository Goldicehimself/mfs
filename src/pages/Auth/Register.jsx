import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  gender: yup.string().required('Gender is required'),
  password: yup.string().min(6).required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
  role: yup.string().required('Role is required'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'technician', gender: 'male' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);

    const { name, email, phone, gender, password, role } = data;
    const result = await registerUser({ name, email, phone, gender, password, role });

    setLoading(false);
    if (!result.success) {
      setServerError('Registration failed.');
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
        {/* Logo + Brand (clickable to home) */}
        <Box textAlign="center" mb={3}>
          <Link component={RouterLink} to="/" underline="none" sx={{ display: 'inline-block', color: 'inherit' }} aria-label="Go to homepage">
            <Box
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              borderRadius: 2,
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

          <Typography fontWeight={700} variant="h6">
            FacilityPro
          </Typography>
          </Link>
        </Box>

        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join our facility management platform to get started
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...fieldProps}
            label="Full Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            {...fieldProps}
            label="Email Address"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...fieldProps}
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          <FormControl component="fieldset" margin="normal" error={!!errors.gender}>
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup
              row
              defaultValue="male"
              {...register('gender')}
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
            {errors.gender && (
              <Typography variant="caption" color="error">
                {errors.gender.message}
              </Typography>
            )}
          </FormControl>

          <TextField
            {...fieldProps}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            {...fieldProps}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirmPassword(v => !v)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select label="Role" defaultValue="technician" {...register('role')}>
              <MenuItem value="facility_manager">Facility Manager</MenuItem>
              <MenuItem value="technician">Maintenance Technician</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="finance">Finance</MenuItem>
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error">
                {errors.role.message}
              </Typography>
            )}
          </FormControl>

          {/* Terms */}
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Checkbox defaultChecked />}
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" fontWeight={600}>
                  Terms and Conditions
                </Link>
              </Typography>
            }
          />

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.4,
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'var(--mp-brand)',
              color: '#ffffff',
              '&:hover': { backgroundColor: 'var(--mp-brand-dark)' },
            }}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={3}
          >
            Already have an account?{' '}
            <Link href="/login" fontWeight={600} sx={{ color: 'var(--mp-brand)', '&:hover': { color: 'var(--mp-brand-dark)' } }}>
              Log in
            </Link>
          </Typography>

        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="caption" color="text.secondary">
            © 2024 FacilityPro. All rights reserved.
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

export default Register;
