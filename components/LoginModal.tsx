import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginModalProps {
  onLogin: (success: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = import.meta.env.VITE_ADMIN_ID;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (id === adminId && pw === adminPassword) {
      onLogin(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-red-700 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border border-white/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">로그인</h2>
          <p className="text-red-100 text-sm">계속하려면 로그인이 필요합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">아이디</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">비밀번호</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-3 text-center font-bold">아이디 또는 비밀번호가 올바르지 않습니다.</p>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-red-700/30"
          >
            로그인
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">관리자 계정으로 로그인하세요</p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
