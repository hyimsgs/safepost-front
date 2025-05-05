import React, { useState } from 'react';
import './index.css';

function App() {
  // 모드: 'analyze' 또는 'risk'
  const [mode, setMode] = useState('analyze');

  // 공통 상태
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 기본 분석 결과
  const [result, setResult] = useState('');

  // 지인 리스크 평가 상태
  const [targetId, setTargetId] = useState('');
  const [riskResult, setRiskResult] = useState('');

  // 이미지 선택 핸들러
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
      alert('JPG 또는 PNG 이미지만 업로드 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // 기본 분석 API 호출
  const handleAnalyze = async () => {
    if (!image) return alert('이미지를 업로드해주세요.');
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('https://safepost.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, caption })
      });
      const data = await res.json();
      console.log('[analyze 응답]', data);
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 지인 리스크 평가 API 호출
  const handleRiskAssess = async () => {
    if (!image) return alert('이미지를 업로드해주세요.');
    if (!targetId) return alert('지인 ID를 입력해주세요.');
    setLoading(true);
    setError('');
    setRiskResult('');
    try {
      const res = await fetch('https://safepost.onrender.com/risk_assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, caption, target_user_id: targetId })
      });
      const data = await res.json();
      console.log('[risk_assess 응답]', data);
      if (!res.ok) throw new Error(data.error || '리스크 평가 실패');
      setRiskResult(data.risk_assessment);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 분석 결과 파싱
  const extractAnalysis = text => {
    const scoreMatch = text.match(/싫어하지 않을 확률:\s*(\d+)/);
    const warningMatch = text.match(/경고:\s*(.*)/);
    const recommendationMatch = text.match(/추천:\s*(.*)/);
    return {
      score: scoreMatch ? parseInt(scoreMatch[1], 10) : null,
      warning: warningMatch ? warningMatch[1].trim() : null,
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : null
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-blue-300 flex items-center justify-center px-4 py-12 text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-2 tracking-tight">SafePost 🌟</h1>
        <p className="text-center text-sm text-gray-500 mb-8">업로드 전에, 당신의 게시물을 안전하게 점검하세요.</p>

        {/* 모드 선택 버튼 */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setMode('analyze')}
            className={`px-4 py-2 rounded-full ${mode === 'analyze' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            기본 분석
          </button>
          <button
            onClick={() => setMode('risk')}
            className={`px-4 py-2 rounded-full ${mode === 'risk' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            지인 리스크 평가
          </button>
        </div>

        {/* 공통: 이미지 업로드 */}
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-5 w-full text-center cursor-pointer hover:border-indigo-400 transition block">
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {image ? '✅ 이미지 선택 완료' : '📷 여기에 이미지를 업로드해보세요'}
        </label>

        {/* 선택된 이미지 미리보기 */}
        {image && (
          <div className="mt-6 rounded-xl overflow-hidden shadow-md animate-fade-in">
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt="업로드된 이미지"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* 캡션 입력 */}
        <textarea
          className="border p-2 mt-4 rounded-xl w-full"
          rows={2}
          placeholder="캡션 입력 (선택)"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        {/* 지인 ID 입력: risk 모드에만 표시 */}
        {mode === 'risk' && (
          <input
            className="border p-2 mt-4 rounded-xl w-full"
            placeholder="지인 ID 입력"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
          />
        )}

        {/* 실행 버튼 */}
        <button
          onClick={mode === 'analyze' ? handleAnalyze : handleRiskAssess}
          disabled={loading}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl text-lg font-semibold transition"
        >
          {loading
            ? mode === 'analyze' ? '분석 중...' : '평가 중...'
            : mode === 'analyze' ? '✨ 분석하기' : '🔍 위험도 평가하기'
          }
        </button>

        {/* 에러 메시지 */}
        {error && (
          <p className="mt-4 text-red-500">⚠️ {error}</p>
        )}

        {/* 기본 분석 결과 */}
        {mode === 'analyze' && result && (
          <div className="mt-8 bg-gray-100 p-5 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">📊 분석 결과</h3>
            <pre className="whitespace-pre-wrap text-sm font-medium text-gray-700">
              {(() => {
                const { score, warning, recommendation } = extractAnalysis(result);
                if (score !== null && warning && recommendation) {
                  return `📊 이 게시물은 ${score}% 확률로 안전합니다.\n🛑 경고: ${warning}\n✨ 추천: ${recommendation}`;
                }
                return '결과를 불러올 수 없습니다.';
              })()}
            </pre>
          </div>
        )}

        {/* 지인 리스크 평가 결과 */}
        {mode === 'risk' && riskResult && (
          <div className="mt-8 bg-gray-100 p-5 rounded-xl whitespace-pre-wrap text-sm">
            <h3 className="text-xl font-semibold mb-3">🔍 지인 리스크 평가 결과</h3>
            <pre>{riskResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;