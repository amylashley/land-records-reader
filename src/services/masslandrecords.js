const axios = require('axios');

class MassLandRecordsService {
    constructor() {
        this.baseUrl = 'https://masslandrecords.com';
    }

    async searchRecords({ county, lastName, indexType }) {
        try {
            console.log(`Searching for: ${lastName} in ${county} county, ${indexType}`);
            
            // For now, return mock data until we can test the actual site
            // This allows the app to function while we debug the real scraping
            return [
                {
                    name: `${lastName}, John`,
                    book: '123',
                    page: '456',
                    date: '2020-01-15',
                    description: 'Property deed transfer'
                },
                {
                    name: `${lastName}, Mary`,
                    book: '124',
                    page: '789',
                    date: '2020-03-22',
                    description: 'Mortgage agreement'
                }
            ];

        } catch (error) {
            console.error('Error during search:', error);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    // Helper method to get available counties
    getAvailableCounties() {
        return [
            'barnstable',
            'berkshire',
            'bristol',
            'dukes',
            'essex',
            'franklin',
            'hampden',
            'hampshire',
            'middlesex',
            'nantucket',
            'norfolk',
            'plymouth',
            'suffolk',
            'worcester'
        ];
    }

    // Helper method to get available index types
    getAvailableIndexTypes() {
        return [
            '1663-1786 Grantors',
            '1787-1889 Grantors',
            '1890-1899 Grantors',
            '1900-1909 Grantors',
            '1910-1919 Grantors',
            '1920-1929 Grantors',
            '1930-1939 Grantors',
            '1940-1944 Grantors',
            '1945-1949 Grantors',
            '1950-1959 Grantors',
            '1960-1964 Grantors',
            '1965-1966 Grantors',
            '1967-1972 Grantors',
            '1973-1974 Grantors',
            '1663-1786 Grantees',
            '1787-1889 Grantees',
            '1890-1899 Grantees',
            '1900-1909 Grantees',
            '1910-1919 Grantees',
            '1920-1929 Grantees',
            '1930-1939 Grantees',
            '1940-1944 Grantees',
            '1945-1949 Grantees',
            '1950-1959 Grantees',
            '1960-1964 Grantees',
            '1965-1966 Grantees',
            '1967-1972 Grantees',
            '1973-1974 Grantees'
        ];
    }
}

module.exports = MassLandRecordsService;
