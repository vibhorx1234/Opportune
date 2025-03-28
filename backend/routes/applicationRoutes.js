// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');
// const Application = require('../models/Application');
// const adminCheck = require('../middleware/admin');

// @route   POST api/applications
// @desc    Apply for a job
// @access  Private
router.post('/', auth, applicationController.applyForJob);

// @route   GET api/applications/user/:userId
// @desc    Get user applications
// @access  Private
router.get('/user/:userId', auth, applicationController.getUserApplications);

// @route   GET api/applications
// @desc    Get all applications
// @access  Private/Admin
// router.get('/', auth, adminCheck, applicationController.getAllApplications);
router.get('/', auth, applicationController.getAllApplications);

// @route   PATCH api/applications/:id/status
// @desc    Update application status
// @access  Private/Admin   
router.patch('/:id/status', auth, applicationController.updateApplicationStatus);

// router.get('/applications/company', auth, applicationController.getRecentApplicationsForCompany);

router.get('/company', auth, async (req, res) => {
    try {
        // First find all jobs belonging to the company
        const companyJobs = await Job.find({ company: req.user.id });
        const jobIds = companyJobs.map(job => job._id);

        // Then find applications for those jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'title')
            .populate('user', 'name email')
            .sort({ appliedDate: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/applications/company', auth, applicationController.getRecentApplicationsForCompany);

module.exports = router;