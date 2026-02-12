import FeaturedProductsManager from './FeaturedProductsManager';

const FestiveSpecialsAdmin = () => {
    return (
        <FeaturedProductsManager
            title="Festive Specials"
            description="Select and arrange products for the Festive Specials section on the homepage."
            settingKey="festive_special_ids"
        />
    );
};

export default FestiveSpecialsAdmin;
