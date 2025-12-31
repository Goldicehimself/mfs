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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password'),
  role: yup.string().required('Role is required'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'technician' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);

    const { name, email, password, role } = data;
    const payload = { name, email, password, role };

    const result = await registerUser(payload);
    setLoading(false);

    if (result.success) {
      // AuthContext already sets user and navigates based on role
    } else {
      // Show a short, generic message only (do not display server-provided messages).
      setServerError('Registration failed.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Create an account
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          label="Role"
          defaultValue="technician"
          {...register('role')}
          error={!!errors.role}
        >
          <MenuItem value="facility_manager">Facility Manager</MenuItem>
          <MenuItem value="technician">Maintenance Technician</MenuItem>
          <MenuItem value="vendor">Vendor</MenuItem>
          <MenuItem value="staff">Staff</MenuItem>
          <MenuItem value="finance">Finance</MenuItem>
        </Select>
        {errors.role && <Typography variant="caption" color="error">{errors.role.message}</Typography>}
      </FormControl>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Register'}
      </Button>

      <Box textAlign="center">
        <Link href="/login" variant="body2">Already have an account? Sign in</Link>
      </Box>
    </Box>
  );
};

export default Register;
