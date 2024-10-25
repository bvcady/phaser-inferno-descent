#ifdef GL_ES
precision mediump float;
#endif

// Uniforms provided by The Book of Shaders (u_resolution is automatically handled)
uniform sampler2D u_tex0;  // The texture image is typically bound to u_tex0
uniform vec2 u_resolution; // Canvas size (used to calculate pixel position)
uniform float u_threshold;    // Threshold to determine dark pixels
uniform float u_falloffRadius; // Maximum distance for falloff effect

// Helper function to compute luminance
float luminance(vec3 color) {
    return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;  // Standard luminance formula
}

void main() {
    // Get the current fragment position in the texture coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Get the current pixel color and alpha from the texture
    vec4 color = texture2D(u_tex0, uv);

    // Check if the current pixel is a dark pixel (based on luminance or color value)
    float pixelLuminance = luminance(color.rgb);
    bool isDark = pixelLuminance < u_threshold;  // A pixel is dark if its luminance is below the threshold

    // If the pixel is not dark, output it as-is
    if (!isDark) {
        gl_FragColor = color;
        return;
    }

    // Variables to store the closest light/transparent pixel information
    float minDistance = u_falloffRadius;  // Start with the maximum falloff distance

    // Sampling surrounding pixels to find the closest light or transparent pixel
    for (int x = -5; x <= 5; x++) {
        for (int y = -5; y <= 5; y++) {
            // Calculate the UV offset for surrounding pixels
            vec2 offset = vec2(float(x), float(y)) / u_resolution;

            // Get the color and alpha of the surrounding pixel
            vec4 sampleColor = texture2D(u_tex0, uv + offset);

            // Determine if the sample is a light or transparent pixel
            float sampleLuminance = luminance(sampleColor.rgb);
            bool isLightOrTransparent = sampleLuminance > u_threshold || sampleColor.a < 0.1;

            // If it's a light or transparent pixel, calculate the distance
            if (isLightOrTransparent) {
                float distance = length(offset * u_resolution);
                minDistance = min(minDistance, distance);  // Keep track of the closest distance
            }
        }
    }

    // Decrease alpha based on the distance to the closest light/transparent pixel
    if (minDistance < u_falloffRadius) {
        float falloffFactor = minDistance / u_falloffRadius;
        color.a *= falloffFactor;  // Scale the alpha value by the distance
    } else {
        color.a = 0.0;  // Make it fully transparent if it's too far from any light/transparent pixel
    }

    // Output the final color with modified alpha
    gl_FragColor = color;
}