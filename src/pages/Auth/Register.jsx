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
} from '@mui/material';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  mode: yup.string().oneOf(['org', 'join']).required(),
  organizationName: yup.string().when('mode', {
    is: 'org',
    then: (s) => s.required('Organization name is required'),
    otherwise: (s) => s.optional(),
  }),
  industry: yup.string().optional(),
  orgCode: yup.string().optional(),
  inviteCode: yup.string().optional(),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  department: yup.string().optional(),
  password: yup.string().min(6).required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
  role: yup.string().when(['mode', 'inviteCode'], {
    is: (mode, inviteCode) => mode === 'join' && !inviteCode,
    then: (s) => s.required('Role is required'),
    otherwise: (s) => s.optional(),
  }),
}).test(
  'org-or-invite',
  'Organization code or invite code is required',
  (values) => values?.mode !== 'join' || !!(values.orgCode || values.inviteCode)
);

const Register = () => {
  const { register: registerUser } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteCodeFromQuery = searchParams.get('invite') || '';
  
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOrgCode, setShowOrgCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      mode: inviteCodeFromQuery ? 'join' : 'org',
      inviteCode: inviteCodeFromQuery || '',
      role: 'technician',
    },
  });

  const mode = watch('mode');
  const inviteCode = watch('inviteCode');
  const orgCodeRegister = register('orgCode');
  const inviteCodeRegister = register('inviteCode');

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);

    const {
      mode: submitMode,
      organizationName,
      industry,
      orgCode,
      inviteCode,
      firstName,
      lastName,
      email,
      phone,
      department,
      password,
      role,
    } = data;
    const result = await registerUser({
      mode: submitMode,
      organizationName,
      industry,
      orgCode: orgCode?.toUpperCase(),
      inviteCode: inviteCode?.toUpperCase(),
      firstName,
      lastName,
      email,
      phone,
      department,
      password,
      role,
    });

    setLoading(false);
    if (!result.success) {
      setServerError('Registration failed.');
    } else if (submitMode === 'org' && result.orgCode) {
      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Organization created</div>
          <div style={{ fontSize: 13 }}>
            Org Code: <strong>{result.orgCode}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(result.orgCode);
                toast.info('Org code copied');
              }
            }}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Copy org code
          </button>
        </div>,
        { autoClose: 9000 }
      );
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

  const features = [
    'Track Work Orders Easily',
    'Prevent Equipment Failures',
    'Manage Vendors Efficiently',
    'View Reports & KPIs',
  ];

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
          <input type="hidden" {...register('mode')} />
          <Box display="flex" gap={1} mb={2}>
            <Button
              type="button"
              variant={mode === 'org' ? 'contained' : 'outlined'}
              onClick={() => setValue('mode', 'org')}
              sx={{
                flex: 1,
                textTransform: 'none',
                borderColor: 'var(--mp-brand)',
                color: mode === 'org' ? '#fff' : 'var(--mp-brand)',
                backgroundColor: mode === 'org' ? 'var(--mp-brand)' : 'transparent',
                '&:hover': { backgroundColor: mode === 'org' ? 'var(--mp-brand-dark)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Create Organization
            </Button>
            <Button
              type="button"
              variant={mode === 'join' ? 'contained' : 'outlined'}
              onClick={() => setValue('mode', 'join')}
              sx={{
                flex: 1,
                textTransform: 'none',
                borderColor: 'var(--mp-brand)',
                color: mode === 'join' ? '#fff' : 'var(--mp-brand)',
                backgroundColor: mode === 'join' ? 'var(--mp-brand)' : 'transparent',
                '&:hover': { backgroundColor: mode === 'join' ? 'var(--mp-brand-dark)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              Join Organization
            </Button>
          </Box>

          {mode === 'org' && (
            <>
              <TextField
                {...fieldProps}
                label="Organization Name"
                {...register('organizationName')}
                error={!!errors.organizationName}
                helperText={errors.organizationName?.message}
              />

              <TextField
                {...fieldProps}
                label="Industry (optional)"
                {...register('industry')}
                error={!!errors.industry}
                helperText={errors.industry?.message}
              />
            </>
          )}

          {mode === 'join' && (
            <>
              <TextField
                {...fieldProps}
                label="Organization Code"
                type={showOrgCode ? 'text' : 'password'}
                {...orgCodeRegister}
                error={!!errors.orgCode}
                helperText={errors.orgCode?.message}
                inputProps={{ maxLength: 12 }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  orgCodeRegister.onChange(e);
                  setValue('orgCode', value, { shouldValidate: true });
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowOrgCode(v => !v)}
                      >
                        {showOrgCode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...fieldProps}
                label="Invite Code (optional)"
                {...inviteCodeRegister}
                error={!!errors.inviteCode}
                helperText={errors.inviteCode?.message}
                inputProps={{ maxLength: 12 }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  inviteCodeRegister.onChange(e);
                  setValue('inviteCode', value, { shouldValidate: true });
                }}
              />
            </>
          )}

          <TextField
            {...fieldProps}
            label="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />

          <TextField
            {...fieldProps}
            label="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
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

          <TextField
            {...fieldProps}
            label="Department (optional)"
            {...register('department')}
            error={!!errors.department}
            helperText={errors.department?.message}
          />

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

          {mode === 'join' && (
            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select label="Role" {...field} disabled={!!inviteCode}>
                    <MenuItem value="facility_manager">Facility Manager</MenuItem>
                    <MenuItem value="technician">Maintenance Technician</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                  </Select>
                )}
              />
              {errors.role && (
                <Typography variant="caption" color="error">
                  {errors.role.message}
                </Typography>
              )}
            </FormControl>
          )}

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
            {loading ? 'Creating Account...' : 'Create Account'}
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

export default Register;
