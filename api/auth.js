export default function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  // Exchange code for token with GitHub
  const tokenUrl = 'https://github.com/login/oauth/access_token';
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  });

  fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
    .then(response => response.json())
    .then(data => {
      if (data.access_token) {
        // Return success response that the CMS expects
        const script = `
          <script>
            (function() {
              function receiveMessage(e) {
                console.log("Received message:", e);
                window.opener.postMessage(
                  'authorization:github:success:{"token":"${data.access_token}","provider":"github"}', 
                  e.origin
                );
                window.removeEventListener("message", receiveMessage, false);
              }
              window.addEventListener("message", receiveMessage, false);
              console.log("Posting message to opener");
              window.opener.postMessage(
                'authorization:github:success:{"token":"${data.access_token}","provider":"github"}', 
                '*'
              );
              setTimeout(function() { window.close(); }, 1000);
            })();
          </script>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
          <html>
            <body>
              <p>Authorization successful! This window should close automatically.</p>
              ${script}
            </body>
          </html>
        `);
      } else {
        res.status(400).json({ error: 'Failed to get access token', details: data });
      }
    })
    .catch(error => {
      console.error('OAuth error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    });
}