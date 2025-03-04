# Automated SSL Certificate Renewal for Node.js + Express Server

## Overview

This script provides an automated solution for renewing SSL certificates using Certbot for Node.js and Express applications. It handles domain validation, certificate retrieval, and server restart processes seamlessly.\
Since Let’s Encrypt has disabled email alerts for users to manually renew their domains, and many people use Node.js + Express.js servers without win-acme for automatic renewal, I developed this simple code to facilitate automatic SSL certificate renewal on your Node.js + Express.js server.

## Features

- Automatic SSL certificate renewal for multiple domains
- HTTP-based ACME challenge handling
- Scheduled certificate expiration checks
- Automatic certificate file copying
- Server restart after certificate renewal

## Prerequisites

- Node.js
- Express.js
- Certbot installed on the system
- Administrative/root access for certificate management

## Installation

1. Clone the repository or download the renewal.js file:
   ```bash
   git clone https://github.com/piroposantosdev/nodejs-express-ssl-auto-renewal.git
   cd your-project-directory
   ```

2. Install dependencies:
   - If you are using windows machine
   ```bash
      Download certbot_signed.exe and install it
   ```

   - If you are using linux machine and don't have snapd installed
   ```bash
      sudo apt update
      sudo apt install snapd
      sudo snap install --classic certbot
   ```

3. Configure the script:
   - Update `domains` array with your specific domain names
   - Modify `certOutputPath` to match your preferred certificate storage location
   - Adjust the `letsEncryptPath` to match your Certbot installation
   - Update the server restart command in `copyLatestCertificates()` function

## Configuration Parameters

- `domains`: List of domains to obtain SSL certificates for
- `certOutputPath`: Directory where certificates will be stored
- `letsEncryptPath`: Certbot's default certificate storage location

## Key Functions

- `renewCertificate()`: Initiates the SSL certificate renewal process
- `parseAndSaveChallenges()`: Handles ACME challenge tokens
- `copyLatestCertificates()`: Copies renewed certificates to specified location
- `scheduleRenewalCheck()`: Periodically checks certificate expiration

## Security Considerations

- The script uses non-interactive mode with Certbot
- Supports multiple domain certificates
- Implements automatic challenge response mechanism

## Deployment

1. Ensure Certbot is installed on your system
2. Configure firewall to allow HTTP challenges
3. Run the script with appropriate permissions

## Manual Renewal Trigger

You can manually trigger certificate renewal by calling:
```javascript
manualRenewalTrigger();
```

## Error Handling

The script includes comprehensive error logging for:
- Certbot execution failures
- Certificate copy errors
- Renewal process interruptions

## Customization

Modify the following to suit your infrastructure:
- Domain list
- Certificate paths
- Server restart mechanism

## Dependencies

- `child_process`: For executing system commands
- `fs`: File system operations
- `path`: Path manipulation

## Logging

Detailed logs are printed to the console, capturing:
- Challenge token details
- Certificate renewal status
- Copy operations
- Error messages

## Troubleshooting

- Ensure Certbot is correctly installed
- Verify domain DNS configuration
- Check network and firewall settings
- Confirm script has necessary permissions

## License

Copyright [2025] [piroposantosdev]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contributing

Contributions are welcome! Please submit pull requests or open issues for improvements and bug fixes.

## Disclaimer

This script is provided as-is. Always test in a staging environment before production deployment.
