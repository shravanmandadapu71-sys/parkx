
import { useState, useEffect } from "react"; 
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";


/* ---------------- LOGIN ---------------- */

function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const sendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
    } else {
      alert("Enter valid 10-digit phone number");
    }
  };

  const verifyOtp = () => {
    if (otp === "123456") {
      navigate("/home");
    } else {
      alert("Invalid OTP. Use 123456");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ padding: "20px", border: "1px solid gray", width: "300px" }}>
        <h2>ParkX Login</h2>

        {!otpSent ? (
          <>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button
              onClick={sendOtp}
              style={{ width: "100%", padding: "10px", backgroundColor: "blue", color: "white", border: "none" }}
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button
              onClick={verifyOtp}
              style={{ width: "100%", padding: "10px", backgroundColor: "green", color: "white", border: "none" }}
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- HOME ---------------- */

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      gap: "20px"
    }}>
      <h2>Welcome to ParkX</h2>

      <button
        onClick={() => navigate("/vehicle")}
        style={{ padding: "12px", width: "200px", backgroundColor: "blue", color: "white", border: "none" }}
      >
        Book Parking
      </button>

      <button
        onClick={() => navigate("/land")}
        style={{ padding: "12px", width: "200px", backgroundColor: "green", color: "white", border: "none" }}
      >
        Upload Land
      </button>
    </div>
  );
}

/* ---------------- VEHICLE ---------------- */

function Vehicle() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  const handleContinue = () => {
    if (!selected) {
      alert("Please select a vehicle");
      return;
    }
    navigate("/map", { state: { vehicle: selected } });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      gap: "20px"
    }}>
      <h2>Select Your Vehicle</h2>

      {["Car", "Bus", "Lorry"].map((type) => (
        <button
          key={type}
          onClick={() => setSelected(type)}
          style={{
            padding: "10px",
            width: "200px",
            backgroundColor: selected === type ? "blue" : "gray",
            color: "white",
            border: "none"
          }}
        >
          {type}
        </button>
      ))}

      <button
        onClick={handleContinue}
        style={{
          padding: "10px",
          width: "200px",
          backgroundColor: "green",
          color: "white",
          border: "none"
        }}
      >
        Continue
      </button>
    </div>
  );
}

/* ---------------- MAP ---------------- */
function MapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle || "Car";

  const [position, setPosition] = useState(null);
  const [lands, setLands] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        setLands([
          {
            id: 1,
            name: "Plot A",
            lat: coords[0] + 0.002,
            lng: coords[1] + 0.002,
            capacity: { Car: 5, Bus: 2, Lorry: 0 },
            occupied: { Car: 2, Bus: 1, Lorry: 0 }
          },
          {
            id: 2,
            name: "Warehouse Yard",
            lat: coords[0] - 0.003,
            lng: coords[1] - 0.002,
            capacity: { Car: 3, Bus: 0, Lorry: 2 },
            occupied: { Car: 3, Bus: 0, Lorry: 1 }
          }
        ]);
      },
      () => {
        alert("Location permission required");
      }
    );
  }, []);

  if (!position) {
    return <h2 style={{ textAlign: "center" }}>Getting your location...</h2>;
  }

  const availableLands = lands.filter(
    (land) => land.capacity[vehicle] > land.occupied[vehicle]
  );

  return (
    <div style={{ height: "100vh" }}>
      <MapContainer center={position} zoom={15} style={{ height: "100%" }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>

        {availableLands.map((land) => (
          <Marker key={land.id} position={[land.lat, land.lng]}>
            <Popup>
              <strong>{land.name}</strong>
              <br />
              Available Slots:{" "}
              {land.capacity[vehicle] - land.occupied[vehicle]}
              <br /><br />

              <button
                onClick={() => {
                  navigate("/plan", {
                    state: {
                      landId: land.id,
                      landName: land.name,
                      vehicle: vehicle,
                      lat: land.lat,
                      lng: land.lng
                    }
                  });
                }}
                style={{
                  padding: "6px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none"
                }}
              >
                Select Plan
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/* ---------------- LAND ---------------- */
function Land() {
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [document, setDocument] = useState(null);

  const [carCap, setCarCap] = useState("");
  const [busCap, setBusCap] = useState("");
  const [lorryCap, setLorryCap] = useState("");

  const [lands, setLands] = useState([]);

  const handleVerify = () => {
    if (!name || !regNumber || !surveyNumber || !document) {
      alert("Fill all details and upload required documents");
      return;
    }

    if (!carCap && !busCap && !lorryCap) {
      alert("Set at least one vehicle capacity");
      return;
    }

    const newLand = {
      id: Date.now(),
      name,
      regNumber,
      surveyNumber,
      capacity: {
        Car: Number(carCap) || 0,
        Bus: Number(busCap) || 0,
        Lorry: Number(lorryCap) || 0
      }
    };

    setLands([...lands, newLand]);

    alert("Land Verified & Added Successfully");

    // Reset form
    setName("");
    setRegNumber("");
    setSurveyNumber("");
    setDocument(null);
    setCarCap("");
    setBusCap("");
    setLorryCap("");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px" }}>
      <h2>Land Upload & Verification</h2>

      <input
        type="text"
        placeholder="Owner Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Registration Number"
        value={regNumber}
        onChange={(e) => setRegNumber(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Survey Number"
        value={surveyNumber}
        onChange={(e) => setSurveyNumber(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <p style={{
        fontWeight: "bold",
        marginTop: "15px",
        marginBottom: "5px"
      }}>
        ENCUMBRANCE CERTIFICATE AND AADHAAR CARD
      </p>

      <input
        type="file"
        onChange={(e) => setDocument(e.target.files[0])}
        style={{ marginBottom: "20px" }}
      />

      <hr />

      <h3>Set Parking Capacity</h3>

      <input
        type="number"
        placeholder="Car Capacity"
        value={carCap}
        onChange={(e) => setCarCap(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Bus Capacity"
        value={busCap}
        onChange={(e) => setBusCap(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Lorry Capacity"
        value={lorryCap}
        onChange={(e) => setLorryCap(e.target.value)}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      {/* ONLY VERIFY BUTTON */}
      <button
        onClick={handleVerify}
        style={{
          padding: "10px 20px",
          backgroundColor: "green",
          color: "white",
          border: "none"
        }}
      >
        Verify & Add Land
      </button>

      <hr />

      <h3>Verified Lands</h3>

      {lands.map((land) => (
        <div key={land.id} style={{ marginBottom: "15px" }}>
          <strong>{land.name}</strong><br />
          Reg: {land.regNumber}<br />
          Survey: {land.surveyNumber}<br />
          Car: {land.capacity.Car} |
          Bus: {land.capacity.Bus} |
          Lorry: {land.capacity.Lorry}
        </div>
      ))}
    </div>
  );
}
/* ---------------- PLAN SELECTION ---------------- */
function Plan() {
  const location = useLocation();
  const navigate = useNavigate();
  const { landId, landName, vehicle, lat, lng } = location.state || {};

  const [selectedPlan, setSelectedPlan] = useState("");
  const [hours, setHours] = useState(1);
  const [price, setPrice] = useState(0);

  const calculatePrice = (plan) => {
    let calculated = 0;

    if (plan === "hourly") {
      calculated = hours * 20; // simple ₹20 per hour
    }

    if (plan === "daily") {
      calculated = 100;
    }

    if (plan === "weekly") {
      calculated = 900;
    }

    if (plan === "monthly") {
      calculated = 2500;
    }

    if (plan === "yearly") {
      calculated = 10000;
    }

    setPrice(calculated);
    setSelectedPlan(plan);
  };

  const proceedPayment = () => {
    if (!selectedPlan) {
      alert("Select a plan");
      return;
    }

    navigate("/payment", {
      state: {
        landId,
        landName,
        vehicle,
        lat,
        lng,
        plan: selectedPlan,
        price
      }
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Select Parking Plan</h2>

      <button onClick={() => calculatePrice("hourly")}>
        Hourly Plan
      </button>

      {selectedPlan === "hourly" && (
        <div>
          <p>Select Hours (1 - 6)</p>
          <input
            type="number"
            min="1"
            max="6"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setPrice(e.target.value * 20);
            }}
          />
        </div>
      )}

      <br />
      <button onClick={() => calculatePrice("daily")}>
        Daily Plan (₹80 - ₹100)
      </button>

      <br /><br />
      <button onClick={() => calculatePrice("weekly")}>
        Weekly Plan (₹600 - ₹900)
      </button>

      <br /><br />
      <button onClick={() => calculatePrice("monthly")}>
        Monthly Plan (₹2000 - ₹2500)
      </button>

      <br /><br />
      <button onClick={() => calculatePrice("yearly")}>
        Yearly Plan (₹7000 - ₹10000)
      </button>

      <hr />

      <h3>Selected Price: ₹{price}</h3>

      <button
        onClick={proceedPayment}
        style={{
          padding: "10px",
          backgroundColor: "green",
          color: "white",
          border: "none"
        }}
      >
        Proceed to Payment
      </button>
    </div>
  );
}
/* ---------------- PAYMENT ---------------- */
function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    landId,
    landName,
    vehicle,
    lat,
    lng,
    plan,
    price
  } = location.state || {};

  const handlePayment = () => {
    // Simulated payment success
    navigate("/ticket", {
      state: {
        landId,
        landName,
        vehicle,
        lat,
        lng,
        plan,
        price
      }
    });
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      marginTop: "100px"
    }}>
      <div style={{
        border: "2px solid black",
        padding: "30px",
        width: "400px"
      }}>
        <h2>Payment Summary</h2>
        <hr />

        <p><strong>Land:</strong> {landName}</p>
        <p><strong>Vehicle:</strong> {vehicle}</p>
        <p><strong>Selected Plan:</strong> {plan}</p>
        <p><strong>Total Amount:</strong> ₹{price}</p>

        <button
          onClick={handlePayment}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            backgroundColor: "green",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );
}
/* ---------------- TICKET ---------------- */
function Ticket() {
  const location = useLocation();
  const { landName, vehicle, lat, lng } = location.state || {};

  const bookingId = "PX" + Date.now();
  const bookingDate = new Date().toLocaleDateString();
  const bookingTime = new Date().toLocaleTimeString();

  const expire = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const expireTime = expire.toLocaleTimeString();

  const handleNavigation = () => {
    if (lat && lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank"
      );
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      marginTop: "50px"
    }}>
      <div style={{
        display: "flex",
        width: "500px",
        border: "2px solid black",
        backgroundColor: "#f9f9f9"
      }}>

        {/* LEFT SIDE */}
        <div style={{
          width: "150px",
          borderRight: "2px solid black",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#eeeeee"
        }}>
          <div>
            <p><strong>City:</strong></p>
            <p>Hyderabad</p>

            <p style={{ marginTop: "20px" }}>
              <strong>State:</strong>
            </p>
            <p>Telangana</p>
          </div>

          <div>
            <p><strong>Land:</strong></p>
            <p>{landName}</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>

          <div>
            <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
              ParkX Ticket
            </h2>
            <hr />

            <p><strong>Booking ID:</strong> {bookingId}</p>
            <p><strong>Vehicle:</strong> {vehicle}</p>
            <p><strong>Booking Date:</strong> {bookingDate}</p>
            <p><strong>Booking Time:</strong> {bookingTime}</p>
            <p><strong>Expire Time:</strong> {expireTime}</p>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px"
          }}>
            <button
              onClick={handleNavigation}
              style={{
                padding: "10px 15px",
                backgroundColor: "#1a4dff",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              Navigate to Parking
            </button>

            <div style={{
              width: "90px",
              height: "90px",
              border: "2px solid black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold"
            }}>
              QR
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- APP ROUTER ---------------- */

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vehicle" element={<Vehicle />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/land" element={<Land />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </Router>
  );
}

export default App;
