import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuVisible(!mobileMenuVisible);
    };

    const closeMobileMenu = () => {
        setMobileMenuVisible(false);
    };

    const menuItems = [
        { key: '/matches', label: '比赛列表', to: '/matches' },
        { key: '/players', label: '选手', to: '/players' },
        { key: '/teams', label: '战队', to: '/teams' },
    ];

    const getSelectedKey = () => {
        if (location.pathname.startsWith('/matches')) return '/matches';
        if (location.pathname.startsWith('/players')) return '/players';
        if (location.pathname.startsWith('/teams')) return '/teams';
        return '';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">MRJZ</Link>
                </div>

                {/* Desktop Menu */}
                <div className="navbar-links desktop-only">
                    {menuItems.map(item => (
                        <Link
                            key={item.key}
                            to={item.to}
                            className={location.pathname.startsWith(item.key) ? 'nav-link active' : 'nav-link'}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <div className="mobile-menu-btn">
                    <Button
                        type="text"
                        icon={<MenuOutlined style={{ color: '#ebedf2', fontSize: '20px' }} />}
                        onClick={toggleMobileMenu}
                    />
                </div>

                {/* Mobile Drawer */}
                <Drawer
                    title="菜单"
                    placement="right"
                    onClose={closeMobileMenu}
                    open={mobileMenuVisible}
                    className="mobile-drawer"
                    styles={{
                        header: { background: '#11161d', borderBottom: '1px solid #1c222b', color: '#fff' },
                        body: { background: '#0b0e14', padding: 0 }
                    }}
                    width={250}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        style={{ background: 'transparent', borderRight: 'none' }}
                        theme="dark"
                    >
                        {menuItems.map(item => (
                            <Menu.Item key={item.key} onClick={closeMobileMenu}>
                                <Link to={item.to}>{item.label}</Link>
                            </Menu.Item>
                        ))}
                    </Menu>
                </Drawer>
            </div>
        </nav>
    );
};

export default Navbar;
