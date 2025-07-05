const puppeteer = require('puppeteer');

class MassLandRecordsService {
    constructor() {
        this.baseUrl = 'https://masslandrecords.com';
        this.browser = null;
        this.page = null;
    }

    async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set user agent to avoid detection
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async searchRecords({ county, lastName, indexType }) {
        try {
            await this.initBrowser();

            // Navigate to the county-specific URL
            const countyUrl = `${this.baseUrl}/${county.toLowerCase()}`;
            console.log(`Navigating to: ${countyUrl}`);
            
            await this.page.goto(countyUrl, { waitUntil: 'networkidle2' });

            // Wait for the search form to load
            await this.page.waitForSelector('select[name*="ACSDropDownList_GrIndex"], select[id*="ACSDropDownList_GrIndex"]', { timeout: 10000 });

            // Select the index type (Grantor/Grantee and date range)
            const indexSelector = 'select[name*="ACSDropDownList_GrIndex"], select[id*="ACSDropDownList_GrIndex"]';
            await this.page.select(indexSelector, indexType);

            // Enter the last name
            const nameInputSelector = 'input[name*="ACSTextBox_MiscStr1"], input[id*="ACSTextBox_MiscStr1"]';
            await this.page.waitForSelector(nameInputSelector);
            await this.page.clear(nameInputSelector);
            await this.page.type(nameInputSelector, lastName);

            // Click the search button
            const searchButtonSelector = 'input[name*="btnSearch"], input[id*="btnSearch"]';
            await this.page.waitForSelector(searchButtonSelector);
            await this.page.click(searchButtonSelector);

            // Wait for results to load
            await this.page.waitForTimeout(3000);

            // Try to find results table or error messages
            const results = await this.page.evaluate(() => {
                const resultRows = [];
                
                // Look for common table structures that might contain results
                const tables = document.querySelectorAll('table');
                
                for (let table of tables) {
                    const rows = table.querySelectorAll('tr');
                    
                    // Skip tables with very few rows (likely headers or navigation)
                    if (rows.length < 2) continue;
                    
                    for (let i = 1; i < rows.length; i++) { // Skip header row
                        const cells = rows[i].querySelectorAll('td');
                        
                        if (cells.length >= 3) { // Minimum columns for meaningful data
                            const row = {
                                name: cells[0]?.textContent?.trim() || '',
                                book: cells[1]?.textContent?.trim() || '',
                                page: cells[2]?.textContent?.trim() || '',
                                date: cells[3]?.textContent?.trim() || '',
                                description: cells[4]?.textContent?.trim() || ''
                            };
                            
                            // Only add if it contains meaningful data
                            if (row.name && (row.book || row.page || row.date)) {
                                resultRows.push(row);
                            }
                        }
                    }
                }
                
                return resultRows;
            });

            // If no results found in tables, check for "no results" messages
            if (results.length === 0) {
                const noResultsText = await this.page.evaluate(() => {
                    const bodyText = document.body.textContent.toLowerCase();
                    if (bodyText.includes('no records found') || 
                        bodyText.includes('no results') || 
                        bodyText.includes('no matches')) {
                        return 'No records found matching your search criteria';
                    }
                    return null;
                });

                if (noResultsText) {
                    console.log('No results found message detected');
                }
            }

            console.log(`Found ${results.length} results`);
            return results;

        } catch (error) {
            console.error('Error during search:', error);
            throw new Error(`Search failed: ${error.message}`);
        } finally {
            await this.closeBrowser();
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
