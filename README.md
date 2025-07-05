# Mass Land Records Reader

A web application for searching Massachusetts Land Records through automated scraping of masslandrecords.com.

## Features

- **Franklin County Support**: Currently supporting Franklin County records (more counties to be added)
- **Index Type Selection**: Choose from Grantor or Grantee records with specific date ranges (1663-1974)
- **Last Name Search**: Find records by last name
- **Results Display**: View search results in a formatted table with Name, Book, Page, and other details
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Scraping**: Directly scrapes masslandrecords.com for up-to-date results

## Installation

1. Clone the repository:
```bash
git clone https://github.com/amylashley/land-records-reader.git
cd land-records-reader
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Select a Massachusetts county from the dropdown
2. Enter the last name you want to search for
3. Choose the appropriate index type (Grantor or Grantee) with date range
4. Click "Search Records" to perform the search
5. View results in the table format

## Available Counties

- Barnstable, Berkshire, Bristol, Dukes, Essex, Franklin, Hampden, Hampshire, Middlesex, Nantucket, Norfolk, Plymouth, Suffolk, Worcester

## Index Types Available

### Grantors & Grantees (1663-1974)
The application supports all available index types from the Mass Land Records database, including both Grantor (seller) and Grantee (buyer) records across various time periods from 1663 to 1974.

## Technical Details

### Architecture
- **Backend**: Node.js with Express.js
- **Frontend**: EJS templating with responsive CSS
- **Scraping**: Puppeteer for web automation
- **Data**: Extracted from masslandrecords.com

### Project Structure
```
src/
├── app.js                 # Main application entry point
├── controllers/
│   └── index.js          # Route handlers
├── public/
│   ├── css/
│   │   └── styles.css    # Styling
│   └── js/
│       └── app.js        # Client-side JavaScript
├── routes/
│   └── index.js          # Route definitions
├── services/
│   ├── masslandrecords-puppeteer.js  # Puppeteer scraping service
│   └── masslandrecords.js            # Mock data service
├── utils/
│   └── index.js          # Utility functions
└── views/
    ├── index.ejs         # Main search form
    └── results.ejs       # Results display
```

## Dependencies

- **express**: Web application framework
- **ejs**: Templating engine
- **puppeteer**: Headless Chrome automation
- **axios**: HTTP client

## Legal Notice

This application is for educational and research purposes. Please ensure you comply with the terms of service of masslandrecords.com when using this tool. Be respectful with request frequency to avoid overloading their servers.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License
