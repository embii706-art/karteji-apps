const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name',
  uploadPreset: 'karteji_preset',
  apiKey: 'your-api-key',
};

export const uploadImage = async (imageUri, folder = 'karteji') => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getOptimizedImageUrl = (url, width = 400, quality = 'auto') => {
  if (!url) return null;
  
  // Transform Cloudinary URL for optimization
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
  }
  return url;
};

export default {
  uploadImage,
  getOptimizedImageUrl,
  config: CLOUDINARY_CONFIG,
};
