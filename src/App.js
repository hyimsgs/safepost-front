import React, { useState } from 'react';
import './index.css';

function App() {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [instaId, setInstaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskResult, setRiskResult] = useState('');

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
      alert('JPG 또는 PNG 이미지만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // 팔로워 리스크 평가 API 호출
  const handleRiskAssess = async () => {
    if (!imageDataUrl) {
      alert('이미지를 업로드해주세요.');
      return;
    }
    if (!instaId) {
      alert('인스타 ID를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setRiskResult('');
    try {
      const base64 = imageDataUrl.split(',')[1];
      const res = await fetch('https://safepost.onrender.com/risk_assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, caption, target_user_id: instaId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '평가 실패');
      setRiskResult(data.risk_assessment);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-blue-300 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-gray-800">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-2">팔로워 리스크 평가</h1>
        <p className="text-center text-sm text-gray-500 mb-8">업로드 전에, 팔로워의 반응 리스크를 평가해보세요.</p>

        {/* 이미지 업로드 */}
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-5 w-full text-center cursor-pointer hover:border-indigo-400 transition block">
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {imageDataUrl ? '✅ 이미지 선택 완료' : '📷 이미지를 업로드하세요'}
        </label>

        {/* 이미지 미리보기 */}
        {imageDataUrl && (
          <div className="mt-6 rounded-xl overflow-hidden shadow-md">
            <img src={imageDataUrl} alt="업로드된 이미지" className="w-full object-cover max-h-96" />
          </div>
        )}

        {/* 캡션 입력 (선택) */}
        <textarea
          className="border p-2 mt-4 rounded-xl w-full"
          rows={2}
          placeholder="캡션 입력 (선택)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* 인스타 ID 입력 */}
        <input
          className="border p-2 mt-4 rounded-xl w-full"
          placeholder="인스타 ID 입력"
          value={instaId}
          onChange={(e) => setInstaId(e.target.value)}
        />

        {/* 평가 버튼 */}
        <button
          onClick={handleRiskAssess}
          disabled={loading}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl text-lg font-semibold transition"
        >
          {loading ? '평가 중...' : '🔍 위험도 평가하기'}
        </button>

        {/* 에러 메시지 */}
        {error && <p className="mt-4 text-red-500">⚠️ {error}</p>}

        {/* 평가 결과 */}
        {riskResult && (
          <div className="mt-8 bg-gray-100 p-5 rounded-xl whitespace-pre-wrap text-sm font-medium text-gray-700">
            <h3 className="text-xl font-semibold mb-3">🔍 평가 결과</h3>
            <pre>{riskResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
