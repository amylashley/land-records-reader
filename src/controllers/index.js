const MassLandRecordsService = require('../services/masslandrecords-puppeteer');

class IndexController {
    constructor() {
        this.massLandRecordsService = new MassLandRecordsService();
    }

    home(req, res) {
        res.render('index');
    }

    async search(req, res) {
        try {
            const { county, lastName, indexType } = req.body;
            
            // Validate required fields
            if (!county || !lastName || !indexType) {
                return res.render('results', {
                    error: 'Please fill in all required fields',
                    results: null,
                    searchParams: { county, lastName, indexType }
                });
            }

            // Perform the search
            const results = await this.massLandRecordsService.searchRecords({
                county,
                lastName,
                indexType
            });

            res.render('results', {
                results,
                error: null,
                searchParams: { county, lastName, indexType }
            });

        } catch (error) {
            console.error('Search error:', error);
            res.render('results', {
                error: 'An error occurred while searching records: ' + error.message,
                results: null,
                searchParams: req.body
            });
        }
    }

    about(req, res) {
        res.send('About Page - Mass Land Records Search Tool');
    }

    handleGetRequest(req, res) {
        res.send('GET request handled');
    }

    handlePostRequest(req, res) {
        res.send('POST request handled');
    }

    // Additional methods for handling other requests can be added here
}

module.exports = IndexController;