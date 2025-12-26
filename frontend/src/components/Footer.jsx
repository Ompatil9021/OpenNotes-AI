const Footer = () => {
  return (
    <footer style={{
      background: '#111',
      borderTop: '1px solid #222',
      padding: '30px 0',
      textAlign: 'center',
      color: '#666',
      marginTop: 'auto' // Pushes footer to bottom if page is short
    }}>
      <p style={{ margin: '0 0 10px 0' }}>Built with 💙 by OpenNotes Team</p>
      <p style={{ fontSize: '0.8rem', margin: 0 }}>© 2025 OpenNotes AI. Empowering Students Everywhere.</p>
    </footer>
  );
};

export default Footer;