const cloudinary = require('cloudinary').v2;

// ÉTAPE 3 — Écriture du script
(async function() {
    console.log('--- TEST CLOUDINARY AFRO VIBE ---');

    // 1. Configurer Cloudinary (Identifiants réels fournis)
    cloudinary.config({ 
        cloud_name: 'dl78pj7uf', 
        api_key: '751176843661382', 
        api_secret: 'GQ0IHuTeKcC3Oa25LRje_DZ3Qtg',
        secure: true
    });
    
    try {
        console.log('1. Téléversement d\'une image de test...');
        // 2. Importer une image de démonstration
        const uploadResult = await cloudinary.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', 
            { public_id: 'afrovibe_test_shoes' }
        );
        
        console.log('✅ Image importée avec succès !');
        console.log('URL Sécurisée:', uploadResult.secure_url);
        console.log('ID Public:', uploadResult.public_id);
        
        // 3. Obtenir les détails de l'image
        console.log('\n2. Détails de l\'image :');
        console.log(`- Largeur: ${uploadResult.width}px`);
        console.log(`- Hauteur: ${uploadResult.height}px`);
        console.log(`- Format: ${uploadResult.format}`);
        console.log(`- Taille: ${uploadResult.bytes} octets`);
        
        // 4. Transformer l'image
        // f_auto : sélection automatique du meilleur format (WebP, AVIF, etc.) selon le navigateur
        // q_auto : compression intelligente sans perte de qualité visuelle perceptible
        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: 'auto',
            quality: 'auto',
            secure: true
        });
        
        console.log('\n3. Transformation :');
        console.log('Terminé ! Cliquez sur le lien ci-dessous pour afficher la version optimisée de l’image. Vérifiez la taille et le format.');
        console.log(optimizeUrl);

    } catch (error) {
        console.error('❌ Erreur lors du test :', error);
    }
})();
