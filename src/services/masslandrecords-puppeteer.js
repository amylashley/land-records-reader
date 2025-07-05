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
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        this.page = await this.browser.newPage();
        
        // Set user agent to match the curl request
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36');
        
        // Set viewport
        await this.page.setViewport({ width: 1555, height: 951 });
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async searchRecords({ county, lastName, indexType }) {
        try {
            await this.initBrowser();

            // Navigate to the county-specific URL (using www. subdomain like in the curl)
            const countyUrl = `https://www.masslandrecords.com/${county.toLowerCase()}/`;
            console.log(`Navigating to: ${countyUrl}`);
            
            await this.page.goto(countyUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Look for the Search Criteria menu and click on it
            console.log('Looking for Search Criteria menu...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit for the page to fully load
            
            // Find and click the Search Criteria menu
            console.log('Clicking Search Criteria menu...');
            const searchCriteriaClicked = await this.page.evaluate(() => {
                const links = document.querySelectorAll('a');
                for (let link of links) {
                    if (link.textContent.includes('Search Criteria') || 
                        link.title.includes('Search Criteria') ||
                        link.href.includes('SearchCriteria')) {
                        link.click();
                        return true;
                    }
                }
                return false;
            });

            if (!searchCriteriaClicked) {
                // Try alternative selectors for the search criteria menu
                console.log('Trying alternative selectors for Search Criteria...');
                const altSearchCriteriaClicked = await this.page.evaluate(() => {
                    // Try different possible selectors
                    const selectors = [
                        'a[href*="SearchCriteria"]',
                        'a[title*="Search"]',
                        'input[value*="Search"]',
                        'button[title*="Search"]'
                    ];
                    
                    for (let selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.click();
                            return true;
                        }
                    }
                    return false;
                });
                
                if (!altSearchCriteriaClicked) {
                    throw new Error('Search Criteria menu not found with any selector');
                }
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Now select either Grantor or Grantee search option based on indexType
            console.log(`Selecting search type based on indexType: ${indexType}`);
            
            let searchTypeText = 'Grantor';
            if (indexType && indexType.toLowerCase().includes('grantee')) {
                searchTypeText = 'Grantee';
            }

            // Look for and click the search type option
            console.log(`Looking for ${searchTypeText} search option...`);
            const searchTypeClicked = await this.page.evaluate((searchText) => {
                const links = document.querySelectorAll('a');
                for (let link of links) {
                    if (link.textContent.includes(searchText)) {
                        link.click();
                        return true;
                    }
                }
                return false;
            }, searchTypeText);

            if (!searchTypeClicked) {
                console.log(`${searchTypeText} search option not found, trying alternative navigation...`);
                // Try alternative selectors for the search type
                const altSearchTypeClicked = await this.page.evaluate((searchText) => {
                    const selectors = [
                        `a[href*="${searchText}"]`,
                        `a[title*="${searchText}"]`,
                        `input[value*="${searchText}"]`,
                        `button[title*="${searchText}"]`
                    ];
                    
                    for (let selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.click();
                            return true;
                        }
                    }
                    return false;
                }, searchTypeText);
                
                if (!altSearchTypeClicked) {
                    throw new Error(`${searchTypeText} search option not found with any selector`);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 3000));

            // Now wait for the correct form with time period dropdown
            console.log('Waiting for search form with time period dropdown...');
            await this.page.waitForSelector('select[name="SearchFormEx1$ACSDropDownList_GrIndex"]', { timeout: 15000 });
            await this.page.waitForSelector('input[name="SearchFormEx1$ACSTextBox_MiscStr1"]', { timeout: 15000 });

            console.log(`Setting index type to: ${indexType}`);
            console.log(`Setting last name to: ${lastName}`);

            // Fill in the form fields using the correct selectors
            const indexSelector = 'select[name="SearchFormEx1$ACSDropDownList_GrIndex"]';
            await this.page.select(indexSelector, indexType);

            const nameInputSelector = 'input[name="SearchFormEx1$ACSTextBox_MiscStr1"]';
            await this.page.evaluate((selector, value) => {
                const input = document.querySelector(selector);
                if (input) {
                    input.value = '';
                    input.value = value;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, nameInputSelector, lastName);

            // Set up request interception to capture the AJAX response
            let searchResponse = null;
            let responseCount = 0;
            
            this.page.on('response', async (response) => {
                const url = response.url();
                const request = response.request();
                
                // Look for the AJAX search response
                if (url.includes('default.aspx') && 
                    request.method() === 'POST' && 
                    request.headers()['x-microsoftajax']) {
                    
                    responseCount++;
                    console.log(`Captured search response #${responseCount}`);
                    try {
                        const responseText = await response.text();
                        if (responseText && responseText.length > 0) {
                            searchResponse = responseText;
                            console.log(`Response ${responseCount} length:`, responseText.length);
                        }
                    } catch (err) {
                        console.log('Error reading response:', err.message);
                    }
                }
            });

            // Click the search button using the correct selector
            console.log('Clicking search button...');
            const searchButtonSelector = 'input[name="SearchFormEx1$btnSearch"]';
            await this.page.waitForSelector(searchButtonSelector);
            
            // Click and wait for response
            await Promise.all([
                this.page.waitForResponse(response => 
                    response.url().includes('default.aspx') && 
                    response.request().method() === 'POST' &&
                    response.request().headers()['x-microsoftajax']
                ),
                this.page.click(searchButtonSelector)
            ]);

            // Wait a bit longer for potential second request and DOM updates
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Parse results from the AJAX response if available
            let results = [];
            if (searchResponse) {
                console.log('Parsing results from AJAX response...');
                results = this.parseAjaxResponse(searchResponse);
                console.log(`Parsed ${results.length} results from AJAX response`);
            }

            // If no results from AJAX response, try DOM extraction as fallback
            if (results.length === 0) {
                console.log('No results from AJAX response, trying DOM extraction...');
                results = await this.extractResultsFromDOM();
                console.log(`Found ${results.length} results from DOM`);
            }

            return results;

        } catch (error) {
            console.error('Error during search:', error);
            throw new Error(`Search failed: ${error.message}`);
        } finally {
            await this.closeBrowser();
        }
    }

    // Parse results from the AJAX response HTML
    parseAjaxResponse(responseText) {
        const results = [];
        
        try {
            // The AJAX response contains HTML fragments
            // Look for the table with results in the DocList1_UpdatePanel
            const tableStartMarker = '<table';
            const tableEndMarker = '</table>';
            
            let currentIndex = 0;
            while (currentIndex < responseText.length) {
                const tableStart = responseText.indexOf(tableStartMarker, currentIndex);
                if (tableStart === -1) break;
                
                const tableEnd = responseText.indexOf(tableEndMarker, tableStart);
                if (tableEnd === -1) break;
                
                const tableHtml = responseText.substring(tableStart, tableEnd + tableEndMarker.length);
                
                // Skip tables that are too small or look like headers/controls
                if (tableHtml.length < 200) {
                    currentIndex = tableEnd + tableEndMarker.length;
                    continue;
                }
                
                // Parse this table for results
                const tableResults = this.parseTableHtml(tableHtml);
                if (tableResults.length > 0) {
                    results.push(...tableResults);
                }
                
                currentIndex = tableEnd + tableEndMarker.length;
            }
            
            return results;
            
        } catch (error) {
            console.error('Error parsing AJAX response:', error);
            return [];
        }
    }

    // Parse HTML table string to extract results
    parseTableHtml(tableHtml) {
        const results = [];
        
        try {
            // Simple regex-based parsing of table rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
            const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
            
            let rowMatch;
            let isFirstRow = true;
            
            while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
                const rowHtml = rowMatch[1];
                
                // Skip the header row
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }
                
                const cells = [];
                let cellMatch;
                
                while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
                    // Clean up the cell content
                    let cellContent = cellMatch[1]
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();
                    
                    cells.push(cellContent);
                }
                
                // Only process rows with meaningful content
                if (cells.length >= 3 && cells.some(cell => cell && cell.length > 0 && !cell.includes('Select'))) {
                    const result = {
                        name: cells[0] || '',
                        book: cells[1] || '',
                        page: cells[2] || '',
                        date: cells[3] || '',
                        description: cells[4] || '',
                        type: cells[5] || '',
                        rawData: cells
                    };
                    
                    // Only add if it has meaningful data
                    if (result.name || result.book || result.page) {
                        results.push(result);
                    }
                }
            }
            
        } catch (error) {
            console.error('Error parsing table HTML:', error);
        }
        
        return results;
    }

    // Extract results from the current DOM as a fallback
    async extractResultsFromDOM() {
        return await this.page.evaluate(() => {
            const resultRows = [];
            
            // Look for result tables that might have been loaded via AJAX
            const tables = document.querySelectorAll('table');
            
            for (let table of tables) {
                const rows = table.querySelectorAll('tr');
                
                // Skip tables with very few rows
                if (rows.length < 2) continue;
                
                // Look for data rows (skip header)
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    
                    if (cells.length >= 3) {
                        // Try to extract meaningful data
                        const rowData = Array.from(cells).map(cell => cell.textContent?.trim() || '');
                        
                        // Skip empty or header-like rows
                        if (rowData.some(data => data && data.length > 0 && !data.includes('Select'))) {
                            const row = {
                                name: rowData[0] || '',
                                book: rowData[1] || '',
                                page: rowData[2] || '',
                                date: rowData[3] || '',
                                description: rowData[4] || '',
                                type: rowData[5] || '',
                                rawData: rowData
                            };
                            
                            // Only add if it contains meaningful data
                            if (row.name || row.book || row.page) {
                                resultRows.push(row);
                            }
                        }
                    }
                }
            }
            
            return resultRows;
        });
    }

    // Helper method to get available counties
    getAvailableCounties() {
        return [
            'franklin'
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
