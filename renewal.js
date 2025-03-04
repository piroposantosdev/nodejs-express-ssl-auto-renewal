const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

//Auto Renew SSL
const domains = ['yourdomain.com', 'www.yourdomain.com', 'subdomain.yourdomain.com'];
const domainFlags = domains.map(domain => `-d ${domain}`).join(' ');

// Certificate storage path
const certOutputPath = 'C:\\Users\\YourName\\YourFolder\\sslcert'; //sslcert is just a folder example, you can change it to your Node.js + Express.js server folder

// Storage for challenge tokens during verification
const challengeResponses = {};

// Middleware to handle ACME challenges
app.use('/.well-known/acme-challenge/:token', (req, res) => {
  const { token } = req.params;

  if (challengeResponses[token]) {
    console.log(`Serving challenge response for token: ${token}`);
    res.set('Content-Type', 'text/plain');
    return res.send(challengeResponses[token]);
  }

  console.log(`Challenge token not found: ${token}`);
  return res.status(404).send('Not found');
});


// Function to run certbot in manual mode and capture the challenge info
function renewCertificate() {
  return new Promise((resolve, reject) => {
    console.log('Starting certificate renewal process...');

    // Clear previous challenge responses
    Object.keys(challengeResponses).forEach(key => delete challengeResponses[key]);

    // We'll use an interactive approach to capture the token and validation
    const certbotProcess = exec(
      `certbot certonly ${domainFlags} --preferred-challenges http --agree-tos --non-interactive --register-unsafely-without-email --standalone`,
      { shell: true },
      (error, stdout, stderr) => {
        if (error) {
          console.error('Certbot execution failed:', error);
          console.error('STDERR:', stderr);
          return reject(error);
        }

        console.log('Certbot output:', stdout);

        // Copy certificates to the desired location
        try {
          copyLatestCertificates();
          resolve(stdout);
        } catch (copyError) {
          reject(copyError);
        }
      }
    );

    // Monitor stdout to extract challenge tokens and responses
    let challengeData = '';
    certbotProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Certbot process output:', output);
      challengeData += output;

      // Parse output for challenge tokens and responses
      parseAndSaveChallenges(challengeData);
    });

    certbotProcess.stderr.on('data', (data) => {
      console.error('Certbot stderr:', data.toString());
    });
  });
}

// Extract challenge tokens and responses from certbot output
function parseAndSaveChallenges(output) {
  // This regex looks for the token and validation content in the certbot output
  const regex = /Create a file containing just this data:\s+([A-Za-z0-9_-]+)\.\s+And make it available on your web server at this URL:\s+http:\/\/[^\/]+\/\.well-known\/acme-challenge\/([A-Za-z0-9_-]+)/g;

  let match;
  while ((match = regex.exec(output)) !== null) {
    const [_, validation, token] = match;
    console.log(`Found challenge: Token=${token}, Validation=${validation}`);
    challengeResponses[token] = validation;
  }

  // If challenge data was found, we need to press Enter to continue
  if (Object.keys(challengeResponses).length > 0) {
    // Wait a moment to ensure the challenge server is ready
    setTimeout(() => {
      exec('echo. | certbot', (error) => {
        if (error) {
          console.error('Error triggering certbot continuation:', error);
        }
      });
    }, 3000);
  }
}

// Copy the certificates from Let's Encrypt's directory to our target directory
function copyLatestCertificates() {
  // Default Let's Encrypt certificate location
  const letsEncryptPath = 'C:\\Certbot\\live\\yourdomain\\'; //Generally certbot save the renewed cert in a folder with your domain name, but in some cases it can be with a 0001, 0002, 0003 suffix

  // Ensure target directory exists
  if (!fs.existsSync(certOutputPath)) {
    fs.mkdirSync(certOutputPath, { recursive: true });
  }

  // Copy each certificate file
  const certFiles = ['cert.pem', 'chain.pem', 'fullchain.pem', 'privkey.pem'];

  certFiles.forEach(filename => {
    const sourcePath = path.join(letsEncryptPath, filename);
    const destPath = path.join(certOutputPath, filename);

    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${filename} to ${destPath}`);
    } catch (error) {
      console.error(`Error copying ${filename}:`, error);
      throw error;
    }
  });

  console.log('All certificate files copied successfully!');


  //Here you can add any function to restart your Node.js + Express.js server, in my example below, i created a .bat file to stopall and restart foverer package
  spawn("cmd.exe", ["/c", "start", "cmd", "/k", "cd /d C:\\Users\\YourUser\\Desktop\\ && ForeverStart.bat"], {
    detached: true,
    stdio: "ignore"
  }).unref();

}

// Schedule certificate renewal check every 24 hours
function scheduleRenewalCheck() {
  console.log("Checking SSL Renew")
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  // Check if certificates need renewal (60 days is typical for Let's Encrypt)
  setInterval(async () => {
    try {
      console.log('Checking if certificates need renewal...');

      // Using certbot to check if renewal is needed (within 30 days of expiry)
      exec('certbot certificates', (error, stdout) => {
        if (error) {
          console.error('Error checking certificates:', error);
          return;
        }

        // Check if renewal is needed based on expiry date
        const expiryMatch = /VALID: (\d+) days/i.exec(stdout);
        if (expiryMatch && Number(expiryMatch[1]) <= 30) {
          console.log(`Certificate expires in ${expiryMatch[1]} days. Starting renewal.`);
          renewCertificate();
        } else {
          console.log('Certificate does not need renewal yet.');
        }
      });
    } catch (error) {
      console.error('Error in certificate renewal check:', error);
    }
  }, TWENTY_FOUR_HOURS);
}

// Function to manually initiate renewal (for testing)
async function manualRenewalTrigger() {
  try {
    await renewCertificate();
    console.log('Certificate renewal completed!');
  } catch (error) {
    console.error('Certificate renewal failed:', error);
  }
}