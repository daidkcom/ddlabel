// frontend/src/components/user/LoginForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { tryLoad } from '../../util/errors';
import { LoginUserReq } from "@ddlabel/shared";
import { MessageContent } from '../../types';
import MessageAlert from '../share/MessageAlert';
import UserApi from '../../api/UserApi';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginUserReq>({ email: '', password: '' });
  const [message, setMessage] = useState<MessageContent>({ text: '', level: 'info' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', level: 'info' });
    const callback = async () => {
      const response = await UserApi.login(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.userRole);
      localStorage.setItem('userId', String(response.userId));

      setTimeout(() => {
        window.location.href = '/packages';
      }, 100);
    };
    tryLoad(setMessage, callback);
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          Welcome to TMS Labeling System
        </Typography>
        <Typography component="p" sx={{ mt: 2 }}>
          This system allows you to manage your shipping packages, generate logistic labels, and track your shipments.
        </Typography>

        <MessageAlert message={message} />
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
