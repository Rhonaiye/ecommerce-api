import multer from 'multer';


const storage = multer.memoryStorage()

const fileFilter = (req, file, cb)=>{
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

   if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
   }

   else{
    cb(new Error('Only jpg, jpeg, webp, png are allowed'), false);
   }
}


export const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB limit
    fileFilter: fileFilter
});

