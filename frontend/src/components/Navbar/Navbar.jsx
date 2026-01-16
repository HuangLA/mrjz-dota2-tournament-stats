import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">MRJZ</Link>
                </div>
                <div className="navbar-links">
                    <Link
                        to="/matches"
                        className={location.pathname.startsWith('/matches') ? 'nav-link active' : 'nav-link'}
                    >
                        比赛列表
                    </Link>
                    <Link
                        to="/teams"
                        className={location.pathname === '/teams' ? 'nav-link active' : 'nav-link'}
                    >
                        战队
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
