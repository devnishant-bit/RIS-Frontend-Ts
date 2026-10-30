import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import "./Login.css";
import axios from "axios";
import logo from "../assets/xray.png";
import tecilogo from "../assets/tecilogo.png";
import pixraylogo from "../assets/pixraylogo.png";
import pixraytext from "../assets/pixraytext.png";
import config from "../../config";
import Swal from "sweetalert2";

axios.defaults.withCredentials = true;

interface LoginProps {
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
}
interface LoginGroup { usergroup: string; expirydays?: number; idletimeout?: number | string; }
interface LoginFeature { featureid: string | number; featurename: string; }
interface LoginState {
  username: string;
  password: string;
  selectedHospital: string;
  hospitals: Array<{ selectedHospital?: string; facilityname: string }>;
  message: string;
  loginstatus: string;
  showPasswordExpirationModal: boolean;
  showSessionModal: boolean;
  showExpiryModal: boolean;
  remainingDays?: number | null;
}

function Login({ onLoginSuccess, navigate }: LoginProps) {
    const [state, setState] = useState<LoginState>({
      username: "",
      password: "",
      selectedHospital: "",
      hospitals: [],
      message: "", // State to store the login message
      loginstatus: "",
      showPasswordExpirationModal: false,
      showSessionModal: false, // State to control session modal visibility
      showExpiryModal: false,
    });
    const updateState = (update: Partial<LoginState>) => setState((previous) => ({ ...previous, ...update }));

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && state.showSessionModal) {
      closeSessionModal();
      void login();
    }
  };

  useEffect(() => {
    void fetchFacilities();
    void checkTrialPeriod();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchFacilities = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/facility/getallfacility`
      );
      updateState({ hospitals: response.data.facilitylist });
    } catch (error: unknown) {
      console.error("Error fetching facilities:", error);
    }
  };

  const checkTrialPeriod = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/tiservice/user/gettrialdata`
      );

      console.log("trialdata", response.data.trialdata);

      if (response.data.retval === "SUCCESS" && response.data.trialdata) {
        const { date, days, active } = response.data.trialdata;
        const trialStartDate = new Date(date);
        const today = new Date();
        const diffTime = today.getTime() - trialStartDate.getTime();
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let remainingDays: number | null = Math.max(days - daysPassed, 0);

        // If active is true, store null in localStorage
        if (active) {
          localStorage.setItem("remainingDays", "null");
          remainingDays = null;
        } else {
          localStorage.setItem("remainingDays", String(remainingDays));
        }

        console.log("Storing remainingDays in localStorage:", remainingDays);

        // Update state & show modal only if trial expired & inactive
        updateState({
          remainingDays,
          showExpiryModal: remainingDays === 0 && !active,
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching trial data:", error);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateState({ [name]: value });
  };

  const handleHospitalChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateState({ selectedHospital: event.target.value });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { username } = state;

    try {
      // Step 1: Check if there is an active session
      const sessionCheckResponse = await axios.post(
        `${config.apiBaseUrl}/tiservice/session/checkusersession`,
        { username }
      );
      console.log("username", username);
      console.log("session", sessionCheckResponse);
      if (sessionCheckResponse.data === "LOGGED_IN") {
        // Show the session modal if an active session is detected
        updateState({
          message: "Already Logged In. Please Logout",
          showSessionModal: true,
        });
        return;
      }

      // Proceed with login if no active session
      await login();
    } catch (error) {
      console.error("Session check error:", error);
      updateState({ message: "Error during session check" });
    }
  };

  const login = async () => {
    const { username, password } = state;
    try {
      const response = await axios.post<string>(
        `${config.apiBaseUrl}/tiservice/session/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data === "SUCCESS_NEWLOGIN") {
        updateState({ message: "Login successful!" });
        localStorage.setItem("username", username);

        // Fetch feature IDs after login
        const featureResponse = await axios.post<{ featurelist?: LoginFeature[] }>(
          `${config.apiBaseUrl}/tiservice/product/getallfeatures`,
          {}
        );

        if (featureResponse.data && featureResponse.data.featurelist) {
          const features = featureResponse.data.featurelist.map((feature) => ({
            featureid: feature.featureid,
            featurename: feature.featurename,
          }));
          // Store the structured data in localStorage
          localStorage.setItem("features", JSON.stringify(features));
        }

        // Fetch user details to get userid
        const userResponse = await axios.post<{ user: { id: string | number; passdate?: string }; groups: LoginGroup[] }>(
          `${config.apiBaseUrl}/tiservice/user/getuserids`,
          { username: username }
        );
        const { user, groups } = userResponse.data;
        const { id: userid, passdate: passwordCreationDate } = user;
        const idleTimeout = groups.length > 0 ? groups[0].idletimeout : null;
        localStorage.setItem("userid", String(userid));
        localStorage.setItem("idleTimeout", String(idleTimeout));
        // console.log("userid", localStorage.getItem("userid"));
        // console.log("idleTimeout", localStorage.getItem("idleTimeout"));

        // Check password expiration and prompt user to change password if expired
        await checkPasswordExpiration(passwordCreationDate, groups);

        /*if (featureResponse.data && featureResponse.data.featurelist) {
          const features = featureResponse.data.featurelist.map(feature => ({
            featureid: feature.featureid,
            featurename: feature.featurename
          }));
          setFeatures(features); // Set the structured data in context
        }*/

        // Call the onLoginSuccess prop to trigger feature fetching
        onLoginSuccess(); // Notify parent to fetch features
      } else {
        updateState({ message: "Invalid Credentials" });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError<string>(error) && error.response?.status === 401) {
        // Check for specific error messages from the server
        const errorMessage = error.response.data;
        if (errorMessage === "ERROR_USER") {
          updateState({ message: "User not found" });
        } else if (errorMessage === "ERROR_PASSWORD") {
          updateState({ message: "Incorrect password" });
        } else if (errorMessage === "ERROR_STATUS") {
          updateState({ message: "User Inactive" });
        } else if (errorMessage === "ERROR_LOGIN") {
          updateState({ message: "Login error. Please try again." });
        } else {
          updateState({ message: "Invalid Credentials" });
        }
      } else {
        console.error("Login error:", error);
        updateState({ message: "Error during login" });
      }
    }
  };

  // Make checkPasswordExpiration async
  const checkPasswordExpiration = async (passwordCreationDate: string | undefined, groups: LoginGroup[] | undefined): Promise<void> => {
    if (!passwordCreationDate || !groups) return;

    const hasEmrAccess = groups.some(
      (group) => group.usergroup === "emraccess"
    );
    if (hasEmrAccess) {
      localStorage.setItem("isPasswordExpired", "false");
      return;
    }

    const creationDate = new Date(passwordCreationDate);
    if (isNaN(creationDate.getTime())) return;

    const passwordExpirationDate = calculatePasswordExpirationDate(
      creationDate,
      groups
    );
    const isExpired =
      passwordExpirationDate && isPasswordExpired(passwordExpirationDate);

    localStorage.setItem("isPasswordExpired", isExpired ? "true" : "false");

    if (isExpired) {
      console.log("Password expired on:", passwordExpirationDate);
      // ⬇️ await so code stops until user clicks OK
      await showPasswordExpirationAlert();
    } else {
      navigate("/worklist");
    }
  };

  const showPasswordExpirationAlert = async () => {
    const result = await Swal.fire({
      title: "Warning!",
      text: "Your password has expired!",
      icon: "warning",
      confirmButtonText: "Ok",
    });

    if (result.isConfirmed) {
      // Show React modal *only after alert is dismissed*
      updateState({ showPasswordExpirationModal: true });
    }
  };

  const closePasswordExpirationModal = () => {
    updateState({ showPasswordExpirationModal: false });
  };

  const calculatePasswordExpirationDate = (passwordCreationDate: Date, groups: LoginGroup[]): Date | null => {
    if (!Array.isArray(groups) || groups.length === 0) {
      console.log("No groups data available");
      return null;
    }

    const expirationDates = groups
      .filter((group): group is LoginGroup & { expirydays: number } =>
        typeof group.expirydays === "number" && group.expirydays > 0)
      .map((group) => {
        const expirationDate = new Date(passwordCreationDate);
        expirationDate.setDate(expirationDate.getDate() + group.expirydays);
        return expirationDate;
      });

    if (expirationDates.length === 0) {
      console.log("No valid expiration dates calculated");
      return null;
    }

    // Find the earliest expiration date
    const earliestExpiration = new Date(
      Math.min(...expirationDates.map((date) => date.getTime()))
    );
    console.log("Calculated expiration date:", earliestExpiration);
    return earliestExpiration;
  };

  const isPasswordExpired = (expirationDate: Date): boolean => {
    if (!(expirationDate instanceof Date) || isNaN(expirationDate.getTime())) {
      console.error("Invalid expiration date:", expirationDate);
      return false;
    }

    const currentDate = new Date();
    // Reset time portion to compare dates only
    currentDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(expirationDate);
    compareDate.setHours(0, 0, 0, 0);

    const isExpired = currentDate > compareDate;
    console.log("Password expiration check:", {
      currentDate,
      expirationDate: compareDate,
      isExpired,
    });
    return isExpired;
  };

  const closeSessionModal = () => {
    updateState({ showSessionModal: false });
  };


    const {
      username,
      password,
      selectedHospital,
      hospitals,
      message,
      showSessionModal,
      showPasswordExpirationModal,
    } = state;

    console.log("remaining days:", localStorage.getItem("remainingDays"));
    
    

    return (
      <>
        <div className="login-App">
          <div className="login-wrapper">
            <div className="area">
              <ul className="circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
              </ul>
            </div>
            <div className="image-container">
              <img src={logo} alt="Login Logo" />
              <img src={tecilogo} alt="Teciatric Logo" />
              <p>&copy; 2024 Teciatric Informatics</p>
              {/* <img src={pixraylogo} alt="Pixray Logo" /> 
              <img src={pixraytext} alt="Pixray Text" /> */}
            </div>
            <div className="login-container">
              <form onSubmit={handleLogin}>
                <div className="input-container">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleInputChange}
                    placeholder="Enter Username"
                  />
                </div>
                <div className="input-container">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                  />
                </div>
                {/* <div className="input-container"> 
                  <label>Select Organisation</label>  
                  <select 
                    name="hospital" 
                    value={selectedHospital} 
                    onChange={handleHospitalChange} 
                    className="dropdown"
                  >
                    <option value="" className="location">Select Location</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.selectedHospital} value={hospital.selectedHospital}>{hospital.facilityname}</option>
                    ))} 
                  </select>
                </div> */}
                <div className="button-container">
                  <button type="submit" className="login">
                    Login
                  </button>
                </div>
              </form>

              {message && <p>{message}</p>}
            </div>
          </div>
        </div>

        {showSessionModal && (
          <div className="loginmodal">
            <div className="loginmodal-content">
              <p>
                Already Logged In. Please Logout or click below to login anyway.
              </p>
              <button
                className="loginmodalbutton"
                onClick={() => {
                  closeSessionModal();
                  login();
                }}
              >
                Login Anyway
              </button>
              <button
                className="loginmodalbutton"
                onClick={closeSessionModal}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showPasswordExpirationModal && (
          <div className="loginmodal">
            <div className="loginmodal-content">
              <p>Your password has expired. Please change your password.</p>
              <button
                className="loginmodalbutton"
                onClick={closePasswordExpirationModal}
              >
                OK
              </button>
            </div>
          </div>
        )}
        {state.showExpiryModal && (
          <div className="expiry-modal-overlay">
            <div className="expiry-modal">
              <h2>Trial Period Expired</h2>
              <p>
                Your trial period has expired. Please update to continue using
                the application.
              </p>
            </div>
          </div>
        )}
      </>
    );
}

export default Login;
