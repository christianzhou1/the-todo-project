import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} SkySync. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

