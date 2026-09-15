package com.brahmaniflower.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Upload single image to Cloudinary under "brahmani-flower/products" folder
    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "brahmani-flower/products",
                            "resource_type", "image",
                            "quality", "auto",       // auto optimize quality
                            "fetch_format", "auto"   // auto convert to WebP/AVIF
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    // Upload single image to Cloudinary under "brahmani-flower/gallery" folder
    public String uploadGalleryImage(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "brahmani-flower/gallery",
                            "resource_type", "image",
                            "quality", "auto",
                            "fetch_format", "auto"
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    // Upload up to 5 images, returns list of URLs
    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                urls.add(uploadImage(file));
            }
        }
        return urls;
    }

    // Delete image from Cloudinary using public_id extracted from URL
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            String publicId = extractPublicId(imageUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Image delete failed: " + e.getMessage());
        }
    }

    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v123/brahmani-flower/products/abc.jpg
    // returns -> brahmani-flower/products/abc
    private String extractPublicId(String url) {
        String[] parts = url.split("/upload/");
        String afterUpload = parts[1]; // v123/brahmani-flower/products/abc.jpg
        String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");
        int dotIndex = withoutVersion.lastIndexOf('.');
        return dotIndex != -1 ? withoutVersion.substring(0, dotIndex) : withoutVersion;
    }
}
