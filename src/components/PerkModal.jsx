
export default function PerkModal({ perk, onApply, onSkip }) {
    return (
        <div style={{position:'fixed', left:20, bottom:20, padding:12, background:'#111', color:'#fff', border:'1px solid #444', borderRadius:8}}>
            <h3>Perk Awarded: {perk.name}</h3>
            <p>Power: {perk.power}</p>
            <div style={{display:'flex', gap:8}}>
                <button onClick={() => onApply && onApply()}>Apply</button>
                <button onClick={() => onSkip && onSkip()}>Skip</button>
            </div>
        </div>
    );
}
