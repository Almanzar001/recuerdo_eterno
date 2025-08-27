// Utility functions for downloading files in the browser

export const downloadQRCode = (qrCodeDataURL: string, filename: string) => {
  try {
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `qr-${filename.replace(/\s+/g, '-').toLowerCase()}.png`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    return false;
  }
};

export const downloadImage = (imageUrl: string, filename: string) => {
  try {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
};