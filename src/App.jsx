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

// Primate database with accurate locations
const primates = [
    {
        name: "Mountain Gorilla",
        scientific: "Gorilla beringei beringei",
        image: "https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=800",
        location: { lat: -1.4, lng: 29.7 },
        region: "Central Africa"
    },
    {
        name: "Bornean Orangutan",
        scientific: "Pongo pygmaeus",
        image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800",
        location: { lat: 0.5, lng: 114.5 },
        region: "Borneo, Indonesia"
    },
    {
        name: "Ring-tailed Lemur",
        scientific: "Lemur catta",
        image: "https://images.unsplash.com/photo-1610104786772-e7d5fed3c952?w=800",
        location: { lat: -23.5, lng: 46.5 },
        region: "Madagascar"
    },
    {
        name: "Japanese Macaque",
        scientific: "Macaca fuscata",
        image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800",
        location: { lat: 36.5, lng: 138.0 },
        region: "Japan"
    },
    {
        name: "Mandrill",
        scientific: "Mandrillus sphinx",
        image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800",
        location: { lat: 0.5, lng: 11.5 },
        region: "Central Africa"
    },
    {
        name: "Howler Monkey",
        scientific: "Alouatta seniculus",
        image: "https://images.unsplash.com/photo-1540206395-68808572332f?w=800",
        location: { lat: -3.5, lng: -62.0 },
        region: "Amazon Rainforest"
    },
    {
        name: "Golden Lion Tamarin",
        scientific: "Leontopithecus rosalia",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
        location: { lat: -22.5, lng: -42.5 },
        region: "Atlantic Forest, Brazil"
    },
    {
        name: "Proboscis Monkey",
        scientific: "Nasalis larvatus",
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800",
        location: { lat: 4.5, lng: 115.0 },
        region: "Borneo"
    },
    {
        name: "Chimpanzee",
        scientific: "Pan troglodytes",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800",
        location: { lat: 5.5, lng: 15.0 },
        region: "Central Africa"
    },
    {
        name: "Spider Monkey",
        scientific: "Ateles geoffroyi",
        image: "https://images.unsplash.com/photo-1502937406922-305bb2789e95?w=800",
        location: { lat: 9.0, lng: -84.0 },
        region: "Central America"
    }
];

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

    const currentPrimate = primates[currentRound];

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
                        <div className="primate-scientific">{currentPrimate?.scientific}</div>
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