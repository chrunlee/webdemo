let express = require('express');

let router = express.Router();

router.post('/',(req,res,next)=>{
    console.log(req);
    console.log(`receive request of api`)
    
})
module.exports = router;