import os, re

files_to_clean = [
    'frontend/src/features/customer/components/ContinuousEstimatorForm.jsx',
    'frontend/src/features/customer/pages/CustomerDashboardPage.jsx',
    'frontend/src/features/customer/pages/CustomerEstimatesPage.jsx',
    'frontend/src/features/auth/components/RegistrationForm.jsx',
    'frontend/src/features/customer/pages/EstimateDetailPage.jsx',
    'frontend/src/features/customer/components/AnalysisReportCard.jsx',
    'frontend/src/features/customer/pages/DeckDetailPage.jsx',
    'frontend/src/features/auth/components/LoginForm.jsx',
    'frontend/src/features/contractor/components/ContractorLayout.jsx',
    'frontend/src/features/customer/components/DeckAnalysisSection.jsx',
    'frontend/src/features/admin/components/CompatibilityTab.jsx',
    'frontend/src/features/admin/components/MaterialCategoriesTab.jsx',
    'frontend/src/features/admin/components/MaterialsTab.jsx',
    'frontend/src/features/admin/components/ServiceCategoriesTab.jsx',
    'frontend/src/features/admin/components/ServicesTab.jsx',
    'frontend/src/features/contractor/pages/ContractorVerificationPage.jsx',
    'frontend/src/features/admin/components/PricingConfigTab.jsx',
    'frontend/src/features/contractor/pages/ContractorDashboardPage.jsx',
    'frontend/src/features/contractor/pages/ContractorLeadsPage.jsx',
    'frontend/src/features/customer/components/EnquiryModal.jsx',
    'frontend/src/features/customer/components/ImageGallery.jsx',
    'frontend/src/features/customer/components/PhotoUploader.jsx',
]

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]|[\u2b50-\u2b55]|[\ufe0f]')

for fpath in files_to_clean:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Specific contextual replacements
    content = content.replace('📐 Dimensions', 'Dimensions')
    content = content.replace('🪵 Surface & Condition', 'Surface & Condition')
    content = content.replace('🛠️ Restoration Services', 'Restoration Services')
    content = content.replace('🎨 Materials & Finish', 'Materials & Finish')
    content = content.replace('📸 Photos', 'Photos')
    content = content.replace('📝 Notes & Location', 'Notes & Location')
    content = content.replace('📋 Review & Calculate', 'Review & Calculate')
    content = content.replace('✨ Live Auto-Saved', 'Auto-Saved')
    content = content.replace('⚠️ Warning:', 'Warning:')
    content = content.replace('⚠️ Error:', 'Error:')
    content = content.replace('✅ Complete', 'Complete')
    content = content.replace('✅ Saved', 'Saved')
    content = content.replace('✅ Live', 'Live')
    content = content.replace('✅ Valid', 'Valid')
    content = content.replace('❌ Cancel', 'Cancel')
    content = content.replace('❌ Close', 'Close')
    content = content.replace('📊 Analytics', 'Analytics')
    content = content.replace('💰 Earnings', 'Earnings')
    content = content.replace('💡 Tip:', 'Tip:')
    content = content.replace('🏠 Home', 'Home')
    content = content.replace('🔗 Estimator', 'Estimator')
    content = content.replace('📋 My Estimates', 'My Estimates')
    content = content.replace('➔ Logout', 'Logout')
    content = content.replace('▶ How It Works', 'How It Works')
    content = content.replace('🛡 Verified', 'Verified')
    content = content.replace('🔒 Protected', 'Protected')
    content = content.replace('⭐ Premium', 'Premium')
    content = content.replace('★', '')
    content = content.replace('✓', '')
    content = content.replace('⚠', '')

    # Generic emoji removal
    cleaned = emoji_pattern.sub('', content)

    # Clean up double spaces or awkward symbols left behind
    cleaned = re.sub(r'>\s+([A-Za-z])', r'>\1', cleaned)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(cleaned)

    print(f'Cleaned: {fpath}')
