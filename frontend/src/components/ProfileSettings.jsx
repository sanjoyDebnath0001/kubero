// frontend/src/components/ProfileSettings.jsx
import React from 'react';
import { Container, Card,Row,Col,Image,Button } from 'react-bootstrap';
import TwoFactorAuthSetup from './TwoFactorAuthSetup.jsx'; // Import the 2FA component
import PortraitPlaceholder from './assets/Portrait_Placeholder.jpg';
const ProfileSettings = () => {
    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });

    const { name, image } = formData;
    const [imageFile,setImage] = useState(null); 
    const [error, setError] = useState(''); // State for displaying errors

    const navigate = useNavigate();
    const onChange = e =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Profile Settings</h1>
            <Card className="mb-4">
                <Card.Body>
                    <h2 className="card-title">General Information</h2>
                    <Row>
                        <Col xs={6} md={4}>
                            <div onChange={onChange} style={{ cursor: 'pointer' }}>
                                <img src={User.Image} alt={PortraitPlaceholder } />
                            </div>
                            
                        </Col>
                    </Row>
                    
                    
                </Card.Body>
            </Card>

            <TwoFactorAuthSetup /> {/* Embed the 2FA setup component */}

            <Card className="mt-4">
                <Card.Body>
                    <h2 className="card-title">Preferences</h2>
                    <p>Manage your application preferences (future feature).</p>
                    {/* Add preferences settings here */}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfileSettings