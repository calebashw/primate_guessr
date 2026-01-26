import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './styles.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Primate database with accurate locations and taxonomic information
const primates = [
    {
        name: "Mountain Gorilla",
        family: "Hominidae (Great Apes)",
        image: "../img/Gorilla.jpg",
        location: { lat: -1.4, lng: 29.7 },
        region: "Central Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hominidae"
        },
        characteristics: [
            "Post-orbital closure (complete bony eye socket)",
            "No tapetum lucidum (no eye shine)",
            "Y-5 molar cusp pattern"
        ]
    },
    {
        name: "Bornean Orangutan",
        family: "Hominidae (Great Apes)",
        image: "../img/Orangutan.jpg",
        location: { lat: 0.5, lng: 114.5 },
        region: "Borneo, Indonesia",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hominidae"
        },
        characteristics: [
            "Post-orbital closure (complete bony eye socket)",
            "Highly opposable thumbs",
            "No tail (characteristic of apes)"
        ]
    },
    {
        name: "Ring-Tailed Lemur",
        family: "Lemuridae (True Lemurs)",
        image: "../img/Ring_tailed_lemur.jpg",
        location: { lat: -23.5, lng: 46.5 },
        region: "Madagascar",
        taxonomy: {
            order: "Primates",
            suborder: "Strepsirrhini",
            infraorder: "Lemuriformes",
            superfamily: "Lemuroidea",
            family: "Lemuridae"
        },
        characteristics: [
            "Tapetum lucidum (reflective eye layer for night vision)",
            "Dental comb (tooth comb for grooming)",
            "Rhinarium (wet nose)"
        ]
    },
    {
        name: "Japanese Macaque",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Japanese_Macaque.jpg",
        location: { lat: 36.5, lng: 138.0 },
        region: "Japan",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Bilophodont molars (two ridges on molars)",
            "Ischial callosities (sitting pads)",
            "Post-orbital closure (complete bony eye socket)"
        ]
    },
    {
        name: "Mandrill",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Mandrill.jpg",
        location: { lat: 0.5, lng: 11.5 },
        region: "Central Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Bilophodont molars (two ridges on molars)",
            "Ischial callosities (sitting pads)",
            "Sexual dichromatism (colorful facial markings)"
        ]
    },
    {
        name: "Howler Monkey",
        family: "Atelidae (Spider & Howler Monkeys)",
        image: "../img/Howler_monkey.jpg",
        location: { lat: -3.5, lng: -62.0 },
        region: "Amazon Rainforest",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Atelidae"
        },
        characteristics: [
            "Prehensile tail (grasping tail with tactile pad)",
            "Enlarged hyoid bone (for loud vocalizations)",
            "Post-orbital closure (complete bony eye socket)"
        ]
    },
    {
        name: "Golden Lion Tamarin",
        family: "Callitrichidae (Marmosets & Tamarins)",
        image: "../img/Golden_lion_tamarin.jpg",
        location: { lat: -22.5, lng: -42.5 },
        region: "Atlantic Forest, Brazil",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Callitrichidae"
        },
        characteristics: [
            "Tegulae (claw-like nails) except hallux",
            "Typically twin births",
            "Small body size with non-prehensile tail"
        ]
    },
    {
        name: "Proboscis Monkey",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Proboscis_monkey.jpg",
        location: { lat: 4.5, lng: 115.0 },
        region: "Borneo",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Bilophodont molars (two ridges on molars)",
            "Ischial callosities (sitting pads)",
            "Sacculated stomach (for leaf digestion)"
        ]
    },
    {
        name: "Chimpanzee",
        family: "Hominidae (Great Apes)",
        image: "../img/Chimpanzee.jpg",
        location: { lat: 5.5, lng: 15.0 },
        region: "Central Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hominidae"
        },
        characteristics: [
            "Y-5 molar cusp pattern",
            "No tail (characteristic of apes)",
            "Knuckle-walking locomotion"
        ]
    },
    {
        name: "Spider Monkey",
        family: "Atelidae (Spider & Howler Monkeys)",
        image: "../img/Spider_monkey.jpg",
        location: { lat: 9.0, lng: -84.0 },
        region: "Central America",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Atelidae"
        },
        characteristics: [
            "Prehensile tail (grasping tail with tactile pad)",
            "Vestigial or absent thumb",
            "Suspensory locomotion (brachiation)"
        ]
    },
    {
        name: "Siamang",
        family: "Hylobatidae (Lesser Apes)",
        image: "../img/Siamang.jpg",
        location: { lat: 2.0, lng: 102.0 },
        region: "Southeast Asia",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hylobatidae"
        },
        characteristics: [
            "No tail (characteristic of apes)",
            "Syndactyly (webbed second and third toes)",
            "Large throat sac for vocalizations"
        ]
    },
    {
        name: "Gibbon",
        family: "Hylobatidae (Lesser Apes)",
        image: "../img/Gibbon.jpg",
        location: { lat: 6.0, lng: 100.0 },
        region: "Southeast Asia",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hylobatidae"
        },
        characteristics: [
            "Elongated forelimbs for brachiation",
            "No tail (characteristic of apes)",
            "Ball-and-socket wrist joint"
        ]
    },
    {
        name: "Baboon",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Baboon.jpg",
        location: { lat: 1.0, lng: 36.0 },
        region: "East Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Bilophodont molars (two ridges on molars)",
            "Ischial callosities (sitting pads)",
            "Terrestrial quadrupedalism"
        ]
    },
    {
        name: "Capuchin Monkey",
        family: "Cebidae (Capuchins & Squirrel Monkeys)",
        image: "../img/Capuchin_monkey.jpg",
        location: { lat: 10.0, lng: -84.0 },
        region: "Central America",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Cebidae"
        },
        characteristics: [
            "Semi-prehensile tail",
            "Nails (ungulae) on all digits",
            "High encephalization quotient (brain-to-body ratio)"
        ]
    },
    {
        name: "Vervet Monkey",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Vervet_monkey.jpg",
        location: { lat: -1.0, lng: 36.0 },
        region: "East Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Bilophodont molars (two ridges on molars)",
            "Ischial callosities (sitting pads)",
            "Cheek pouches for food storage"
        ]
    },
    {
        name: "Marmoset",
        family: "Callitrichidae (Marmosets & Tamarins)",
        image: "../img/Marmoset.jpg",
        location: { lat: -5.0, lng: -38.0 },
        region: "Brazil",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Callitrichidae"
        },
        characteristics: [
            "Tegulae (claw-like nails) except hallux",
            "Specialized incisors for tree gouging",
            "Typically twin births"
        ]
    },
    {
        name: "Squirrel Monkey",
        family: "Cebidae (Capuchins & Squirrel Monkeys)",
        image: "../img/Squirrel_monkey.jpg",
        location: { lat: -3.0, lng: -60.0 },
        region: "Amazon Rainforest",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Ceboidea",
            family: "Cebidae"
        },
        characteristics: [
            "Non-prehensile tail (used for balance)",
            "Nails (ungulae) on all digits",
            "Large brain relative to body size"
        ]
    },
    {
        name: "Colobus Monkey",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Colobus_monkey.jpg",
        location: { lat: 1.0, lng: 35.0 },
        region: "East Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Reduced or absent thumbs",
            "Sacculated stomach (for leaf digestion)",
            "Bilophodont molars (two ridges on molars)"
        ]
    },
    {
        name: "Tarsier",
        family: "Tarsiidae (Tarsiers)",
        image: "../img/Tarsier.jpg",
        location: { lat: 10.0, lng: 125.0 },
        region: "Philippines",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Tarsiiformes",
            superfamily: "Tarsioidea",
            family: "Tarsiidae"
        },
        characteristics: [
            "Enormous eyes (each eye larger than brain)",
            "No tapetum lucidum despite nocturnal habits",
            "Fused tibia and fibula (tibio-fibula)"
        ]
    },
    {
        name: "Indri",
        family: "Indriidae (Indris & Sifakas)",
        image: "../img/Indri.jpg",
        location: { lat: -18.0, lng: 47.0 },
        region: "Madagascar",
        taxonomy: {
            order: "Primates",
            suborder: "Strepsirrhini",
            infraorder: "Lemuriformes",
            superfamily: "Lemuroidea",
            family: "Indriidae"
        },
        characteristics: [
            "Tapetum lucidum (reflective eye layer)",
            "Dental comb (tooth comb for grooming)",
            "Vertical clinging and leaping locomotion"
        ]
    },
    {
        name: "Aye-aye",
        family: "Daubentoniidae (Aye-ayes)",
        image: "../img/Aye-aye.jpg",
        location: { lat: -18.0, lng: 46.0 },
        region: "Madagascar",
        taxonomy: {
            order: "Primates",
            suborder: "Strepsirrhini",
            infraorder: "Chiromyiformes",
            superfamily: "Daubentonioidea",
            family: "Daubentoniidae"
        },
        characteristics: [
            "Continuously growing incisors (rodent-like)",
            "Elongated middle finger for percussive foraging",
            "Tapetum lucidum (reflective eye layer)"
        ]
    },
    {
        name: "Sifaka",
        family: "Indriidae (Indris & Sifakas)",
        image: "../img/Sifaka.jpg",
        location: { lat: -22.0, lng: 45.0 },
        region: "Madagascar",
        taxonomy: {
            order: "Primates",
            suborder: "Strepsirrhini",
            infraorder: "Lemuriformes",
            superfamily: "Lemuroidea",
            family: "Indriidae"
        },
        characteristics: [
            "Vertical clinging and leaping locomotion",
            "Dental comb (tooth comb for grooming)",
            "Tapetum lucidum (reflective eye layer)"
        ]
    },
    {
        name: "Bonobo",
        family: "Hominidae (Great Apes)",
        image: "../img/Bonobo.jpg",
        location: { lat: -2.0, lng: 20.0 },
        region: "Congo Basin",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Hominoidea",
            family: "Hominidae"
        },
        characteristics: [
            "Y-5 molar cusp pattern",
            "No tail (characteristic of apes)",
            "Post-orbital closure (complete bony eye socket)"
        ]
    },
    {
        name: "Red Colobus",
        family: "Cercopithecidae (Old World Monkeys)",
        image: "../img/Red_colobus.jpg",
        location: { lat: 7.0, lng: -8.0 },
        region: "West Africa",
        taxonomy: {
            order: "Primates",
            suborder: "Haplorhini",
            infraorder: "Simiiformes",
            superfamily: "Cercopithecoidea",
            family: "Cercopithecidae"
        },
        characteristics: [
            "Reduced or absent thumbs",
            "Sacculated stomach (for leaf digestion)",
            "Bilophodont molars (two ridges on molars)"
        ]
    },
    {
        name: "Slow Loris",
        family: "Lorisidae (Lorises & Pottos)",
        image: "../img/Slow_loris.jpg",
        location: { lat: 3.0, lng: 101.0 },
        region: "Southeast Asia",
        taxonomy: {
            order: "Primates",
            suborder: "Strepsirrhini",
            infraorder: "Lorisiformes",
            superfamily: "Lorisoidea",
            family: "Lorisidae"
        },
        characteristics: [
            "Tapetum lucidum (reflective eye layer)",
            "Dental comb (tooth comb for grooming)",
            "Venom-producing brachial gland"
        ]
    }
];

// Function to randomly select unique primates
function selectRandomPrimates(primateArray, count) {
    const shuffled = [...primateArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const MAX_ROUNDS = 5;

// Custom hook for map click events
function MapClickHandler({ onMapClick, disabled }) {
    useMapEvents({
        click: (e) => {
            if (!disabled) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
}

// Component to handle map bounds fitting and view reset
function MapBoundsFitter({ bounds, resetView }) {
    const map = useMap();
    
    useEffect(() => {
        if (resetView) {
            map.setView([20, 0], 2);
        } else if (bounds && Array.isArray(bounds) && bounds.length === 2) {
            const [point1, point2] = bounds;
            // Only fit bounds if points are different
            if (point1 && point2 && 
                (point1[0] !== point2[0] || point1[1] !== point2[1])) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [bounds, resetView, map]);
    
    return null;
}

function App() {
    const [currentRound, setCurrentRound] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [mapBounds, setMapBounds] = useState(null);
    const [canGuess, setCanGuess] = useState(true);
    const [resetMapView, setResetMapView] = useState(false);
    const [selectedPrimates, setSelectedPrimates] = useState(() => selectRandomPrimates(primates, MAX_ROUNDS));

    const currentPrimate = selectedPrimates[currentRound];

    // Early return if primate data isn't available
    if (!currentPrimate && !gameOver) {
        return <div>Loading...</div>;
    }

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Calculate score based on distance
    // Work on scoring more
    const calculateScore = (distance) => {
        const maxDistance = 5000; // 5,000 km
        if (distance > maxDistance) return 0;
        
        const normalized = 1 - (distance / maxDistance);
        return Math.round(Math.pow(normalized, 2) * 1000);
    };

    const handleMapClick = (latlng) => {
        if (!showResult) {
            setUserGuess(latlng);
        }
    };

    const handleSubmitGuess = () => {
        if (!userGuess || !currentPrimate) return;

        const distance = calculateDistance(
            userGuess.lat,
            userGuess.lng,
            currentPrimate.location.lat,
            currentPrimate.location.lng
        );

        const score = calculateScore(distance);
        setTotalScore(prev => prev + score);

        // Update streak
        let newStreak = currentStreak;
        if (distance < 500) {
            newStreak = currentStreak + 1;
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
            }
        } else {
            newStreak = 0;
        }
        setCurrentStreak(newStreak);

        // Set map bounds to show both markers
        setMapBounds([
            [userGuess.lat, userGuess.lng],
            [currentPrimate.location.lat, currentPrimate.location.lng]
        ]);

        // Show result
        setResultData({
            distance,
            score,
            region: currentPrimate.region
        });
        setShowResult(true);
    };

    const handleNextRound = () => {
        if (currentRound + 1 >= MAX_ROUNDS) {
            setGameOver(true);
        } else {
            setCurrentRound(prev => prev + 1);
        setUserGuess(null);
        setShowResult(false);
        setResultData(null);
        setCanGuess(true);
        setMapBounds(null);
        setResetMapView(true);
        setTimeout(() => setResetMapView(false), 100);
        }
    };

    // Reset map view when round changes
    useEffect(() => {
        if (!showResult && !gameOver && currentRound > 0) {
            setResetMapView(true);
            setTimeout(() => setResetMapView(false), 100);
        }
    }, [currentRound, showResult, gameOver]);

    const handleRestart = () => {
        setCurrentRound(0);
        setTotalScore(0);
        setCurrentStreak(0);
        setBestStreak(0);
        setUserGuess(null);
        setShowResult(false);
        setResultData(null);
        setGameOver(false);
        setCanGuess(true);
        setMapBounds(null);
        // Select new random primates for the new game
        setSelectedPrimates(selectRandomPrimates(primates, MAX_ROUNDS));
    };

    if (gameOver) {
        const avgScore = Math.round(totalScore / MAX_ROUNDS);
        return (
            <div className="game-container">
                <div className="header">
                    <h1>🐵 PrimateGuessr 🌍</h1>
                    <p>Can you guess where these amazing primates come from?</p>
                </div>
                <div className="controls">
                    <div className="game-over">
                        <h2>🎉 Game Complete! 🎉</h2>
                        <div className="final-stats">
                            <p><strong>Total Score:</strong> {totalScore} points</p>
                            <p><strong>Average per Round:</strong> {avgScore} points</p>
                            <p><strong>Best Streak:</strong> {bestStreak} perfect guesses</p>
                        </div>
                        <button className="btn btn-primary pulse" onClick={handleRestart}>
                            Play Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getResultContent = () => {
        if (!resultData) return null;

        const { distance, score, region } = resultData;
        const distanceKm = Math.round(distance);
        const isCorrect = distance < 2000;

        let title, message;
        if (distance < 100) {
            title = '🎯 Perfect!';
            message = 'You nailed it! Amazing geographical knowledge!';
        } else if (distance < 500) {
            title = '🌟 Excellent!';
            message = 'Very close! You know your primates!';
        } else if (distance < 2000) {
            title = '👍 Good Job!';
            message = 'Not bad! You got the right region!';
        } else {
            title = '🤔 Not Quite';
            message = `This primate is found in ${region}`;
        }

        return (
            <div className={`modal ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="modal-content">
                    <h2>{title}</h2>
                    <div className="distance-info">
                        Distance: {distanceKm.toLocaleString()} km away
                    </div>
                    <div className="points-earned">+{score} points</div>
                    <p>{message}</p>
                    <button className="btn btn-primary" onClick={handleNextRound}>
                        {currentRound + 1 >= MAX_ROUNDS ? 'See Results' : 'Continue'}
                    </button>
                </div>
            </div>
        );
    };

    const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const lineColor = resultData && resultData.distance < 500 ? 'green' : 
                      resultData && resultData.distance < 2000 ? 'orange' : 'red';

    return (
        <div className="game-container">
            <div className="header">
                <h1>🐵 PrimateGuessr 🌍</h1>
                <p>Can you guess where these amazing primates come from?</p>
            </div>

            <div className="score-board">
                <div className="score-item">
                    <div className="score-label">Round</div>
                    <div className="score-value">{currentRound + 1}</div>
                </div>
                <div className="score-item">
                    <div className="score-label">Score</div>
                    <div className="score-value">{totalScore}</div>
                </div>
                <div className="score-item">
                    <div className="score-label">Best Streak</div>
                    <div className="score-value">{bestStreak}</div>
                </div>
            </div>

            <div className="game-content">
                <div className="primate-section">
                    <div className="primate-card">
                        <img 
                            src={currentPrimate?.image} 
                            alt={currentPrimate?.name}
                            className="primate-image"
                        />
                        <div className="primate-name">{currentPrimate?.name}</div>
                        <div className="primate-family">{currentPrimate?.family}</div>
                        
                        <div className="taxonomy-section">
                            <div className="taxonomy-title">Taxonomy</div>
                            <div className="taxonomy-grid">
                                <span className="taxonomy-label">Order:</span>
                                <span className="taxonomy-value">{currentPrimate?.taxonomy?.order}</span>
                                <span className="taxonomy-label">Suborder:</span>
                                <span className="taxonomy-value">{currentPrimate?.taxonomy?.suborder}</span>
                                <span className="taxonomy-label">Infraorder:</span>
                                <span className="taxonomy-value">{currentPrimate?.taxonomy?.infraorder}</span>
                                <span className="taxonomy-label">Superfamily:</span>
                                <span className="taxonomy-value">{currentPrimate?.taxonomy?.superfamily}</span>
                            </div>
                        </div>

                        <div className="characteristics-section">
                            <div className="characteristics-title">Identifying Characteristics</div>
                            <ul className="characteristics-list">
                                {currentPrimate?.characteristics?.map((char, index) => (
                                    <li key={index}>{char}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="instruction">
                            👆 Click on the map to guess where this primate is found in the wild!
                        </div>
                    </div>
                </div>

                <div className="map-section">
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        minZoom={2}
                        maxZoom={8}
                        worldCopyJump={true}
                        className="map-container"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© OpenStreetMap contributors'
                            noWrap={false}
                        />
                        <MapClickHandler onMapClick={handleMapClick} disabled={showResult} />
                        <MapBoundsFitter bounds={mapBounds} resetView={resetMapView} />
                        
                        {userGuess && (
                            <Marker position={[userGuess.lat, userGuess.lng]} icon={blueIcon}>
                                <Popup>Your Guess</Popup>
                            </Marker>
                        )}
                        
                        {showResult && currentPrimate && (
                            <>
                                <Marker 
                                    position={[currentPrimate.location.lat, currentPrimate.location.lng]} 
                                    icon={greenIcon}
                                >
                                    <Popup>Correct Location: {currentPrimate.region}</Popup>
                                </Marker>
                                <Polyline
                                    positions={[
                                        [userGuess.lat, userGuess.lng],
                                        [currentPrimate.location.lat, currentPrimate.location.lng]
                                    ]}
                                    pathOptions={{
                                        color: lineColor,
                                        weight: 3,
                                        opacity: 0.7,
                                        dashArray: '10, 10'
                                    }}
                                />
                            </>
                        )}
                    </MapContainer>
                </div>
            </div>

            <div className="controls">
                {!showResult ? (
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmitGuess}
                        disabled={!userGuess}
                    >
                        Submit Guess
                    </button>
                ) : (
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleNextRound}
                    >
                        {currentRound + 1 >= MAX_ROUNDS ? 'See Results' : 'Next Primate'}
                    </button>
                )}
            </div>

            {showResult && getResultContent()}
        </div>
    );
}

export default App;