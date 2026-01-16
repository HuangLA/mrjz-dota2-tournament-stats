import React from 'react';
import { getHeroIconUrl } from '../../../utils/heroUtils';
import { getItemImageUrl } from '../../../utils/itemUtils';

const PlayerRow = ({ player, team }) => {
    const kda = `${player.kills}/${player.deaths}/${player.assists}`;
    const kdaRatio = player.deaths === 0 ? player.kills + player.assists :
        ((player.kills + player.assists) / player.deaths).toFixed(2);

    // 解析主装备数据
    const items = player.items || [];
    while (items.length < 6) {
        items.push(null);
    }

    // 背包装备
    const backpackItems = [
        player.item_backpack_0,
        player.item_backpack_1,
        player.item_backpack_2
    ];

    // 中立装备
    const neutralItem = player.item_neutral;

    return (
        <div className={`player-row ${team}`}>
            <div className="col-hero">
                <div className="hero-avatar">
                    <img
                        src={getHeroIconUrl(player.hero_id)}
                        alt={`Hero ${player.hero_id}`}
                        onError={(e) => {
                            e.target.src = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png';
                        }}
                    />
                </div>
            </div>

            <div className="col-player">
                <div className="player-info">
                    {player.Player?.avatar_url && (
                        <img
                            src={player.Player.avatar_url}
                            alt={player.Player.nickname}
                            className="player-avatar"
                        />
                    )}
                    <span className="player-name">
                        {player.Player?.nickname ? (
                            player.Player.nickname.startsWith('Player_') ? (
                                <span className="player-name-loading">
                                    <span className="loading-dots">加载中</span>
                                </span>
                            ) : (
                                player.Player.nickname
                            )
                        ) : (
                            `Player ${player.player_id}`
                        )}
                    </span>
                </div>
            </div>

            <div className="col-kda">
                <span className="kda-text">{kda}</span>
                <span className="kda-ratio">({kdaRatio})</span>
            </div>

            <div className="col-lhd">
                <span className="stat-value">{player.last_hits || 0}/{player.denies || 0}</span>
            </div>

            <div className="col-nw">
                <span className="stat-value">{(player.net_worth || 0).toLocaleString()}</span>
            </div>

            <div className="col-gpm">
                <span className="stat-value">{player.gpm || 0}</span>
            </div>

            <div className="col-xpm">
                <span className="stat-value">{player.xpm || 0}</span>
            </div>

            <div className="col-damage">
                <span className="stat-value">{player.hero_damage?.toLocaleString() || 0}</span>
            </div>

            <div className="col-items">
                <div className="items-container">
                    {/* 左侧：主装备 (6个，2行x3列) + 背包 (3个) */}
                    <div className="items-left">
                        {/* 主装备 */}
                        <div className="items-main-grid">
                            {items.map((itemId, index) => {
                                const itemUrl = itemId && itemId !== 0 ? getItemImageUrl(itemId) : null;
                                return (
                                    <div key={index} className="item-slot">
                                        {itemUrl ? (
                                            <img
                                                src={itemUrl}
                                                alt={`Item ${itemId}`}
                                                className="item-icon"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="item-empty"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 背包 */}
                        <div className="items-backpack-row">
                            {backpackItems.map((itemId, index) => {
                                const itemUrl = itemId && itemId !== 0 ? getItemImageUrl(itemId) : null;
                                return (
                                    <div key={`bp-${index}`} className="item-slot item-backpack">
                                        {itemUrl ? (
                                            <img
                                                src={itemUrl}
                                                alt={`Backpack ${itemId}`}
                                                className="item-icon"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="item-empty"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 右侧：中立装备 (1个，垂直居中) */}
                    <div className="items-right">
                        <div className="item-slot item-neutral">
                            {neutralItem && neutralItem !== 0 ? (
                                <img
                                    src={getItemImageUrl(neutralItem)}
                                    alt={`Neutral ${neutralItem}`}
                                    className="item-icon"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="item-empty"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerRow;
