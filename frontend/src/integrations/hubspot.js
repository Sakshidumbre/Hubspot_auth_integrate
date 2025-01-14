import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, Divider, Stack } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HubIcon from '@mui/icons-material/Hub';

export const HubspotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'Hubspot Authorization', 'width=600, height=600');

            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail || 'Error connecting to Hubspot.');
        }
    };

    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
            const credentials = response.data;
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'Hubspot' }));
            }
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail || 'Failed to fetch credentials.');
        }
    };

    useEffect(() => {
        setIsConnected(!!integrationParams?.credentials);
    }, [integrationParams]);

    return (
        <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                Hubspot Integration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {isConnected ? (
                <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success">
                    Hubspot is successfully connected.
                </Alert>
            ) : (
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Connect your Hubspot account to seamlessly integrate data.
                </Typography>
            )}

            <Stack spacing={2} alignItems="center" mt={3}>
                <Button
                    variant="contained"
                    color={isConnected ? 'success' : 'primary'}
                    startIcon={isConnected ? <HubIcon /> : null}
                    onClick={!isConnected ? handleConnectClick : undefined}
                    disabled={isConnecting || isConnected}
                    sx={{ width: '100%', maxWidth: 300 }}
                >
                    {isConnecting ? <CircularProgress size={24} /> : isConnected ? 'Hubspot Connected' : 'Connect to Hubspot'}
                </Button>
            </Stack>
        </Box>
    );
};
