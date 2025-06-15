import AWS from 'aws-sdk';

// Guess MIME type based only on file extension
function guessMimeType(fileName) {
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.webp')) return 'image/webp';
  if (fileName.endsWith('.gif')) return 'image/gif';
  if (fileName.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}


// Configure AWS S3 for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: 'https://2b33679eac7666d9d148fbae154140ec.r2.cloudflarestorage.com',
  accessKeyId: 'c9ce83397ad35223fdfc233af10f5932',
  secretAccessKey: '0c3d2807c969be86dfb47b44f0d60974bb37c8beb3433f7ee78cfb82fd8788bf',
  region: 'auto',
  signatureVersion: 'v4',
});

const BUCKET_NAME = 'rentailz-images';

export async function uploadFileToR2(buffer, fileName) {
  try {
    const key = `uploads/${Date.now()}-${fileName}`;

    const result = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: guessMimeType(fileName),
    }).promise();

    return {
      key,
      url: `https://rentailz.com.ng/${key}`, // replace with your CDN domain if different
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw error;
  }
}

const exctractKeyFromUrl = async (url = '')=>{
   const baseUrl = 'https://rentailz.com.ng/'

   if(url.startsWith(baseUrl)){
     return url.slice(baseUrl.length)
   }

   throw new Error('Invalid url format')
}



export async function editImageOnR2(image_url, buffer, fileName) {
  try {

    const oldKey = await exctractKeyFromUrl(image_url)
    // Delete the old image
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: oldKey,
    }).promise();

    // Upload the new image
    const key = `uploads/${Date.now()}-${fileName}`;
    const result = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: guessMimeType(fileName),
    }).promise();

    return {
      key,
      url: `https://rentailz.com.ng/${key}`,
    };
  } catch (error) {
    console.error('R2 edit image error:', error);
    throw error;
  }
}
