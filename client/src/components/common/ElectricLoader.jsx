// import React from 'react';

// const ElectricLoader = () => {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden">
//       <div className="relative">
//         {/* Main electric orb */}
//         <div className="relative w-32 h-32 flex items-center justify-center">
//           {/* Outer electric ring */}
//           <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-spin" 
//                style={{
//                  animation: 'electricSpin 2s linear infinite',
//                  filter: 'drop-shadow(0 0 20px #22d3ee)',
//                }}>
//             <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
//                  style={{filter: 'drop-shadow(0 0 10px #22d3ee)'}}></div>
//             <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 translate-y-1/2"
//                  style={{filter: 'drop-shadow(0 0 8px #60a5fa)'}}></div>
//             <div className="absolute left-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
//                  style={{filter: 'drop-shadow(0 0 8px #c084fc)'}}></div>
//             <div className="absolute right-0 top-1/2 w-2 h-2 bg-pink-400 rounded-full transform translate-x-1/2 -translate-y-1/2"
//                  style={{filter: 'drop-shadow(0 0 8px #f472b6)'}}></div>
//           </div>

//           {/* Inner pulsing core */}
//           <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"
//                style={{
//                  animation: 'electricPulse 1.5s ease-in-out infinite alternate',
//                  filter: 'drop-shadow(0 0 30px #0ea5e9)',
//                }}>
//             <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
//                  style={{
//                    animation: 'innerGlow 2s ease-in-out infinite alternate',
//                    filter: 'drop-shadow(0 0 20px #8b5cf6)',
//                  }}>
//             </div>
//           </div>

//           {/* Electric sparks */}
//           <div className="absolute inset-0">
//             {[...Array(8)].map((_, i) => (
//               <div
//                 key={i}
//                 className="absolute w-1 h-8 bg-gradient-to-t from-transparent via-cyan-400 to-transparent"
//                 style={{
//                   left: '50%',
//                   top: '50%',
//                   transformOrigin: '50% 4rem',
//                   transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
//                   animation: `electricSpark 3s linear infinite ${i * 0.2}s`,
//                   filter: 'drop-shadow(0 0 4px #22d3ee)',
//                 }}
//               />
//             ))}
//           </div>

//           {/* Floating particles */}
//           {[...Array(12)].map((_, i) => (
//             <div
//               key={`particle-${i}`}
//               className="absolute w-1 h-1 bg-cyan-300 rounded-full"
//               style={{
//                 left: '50%',
//                 top: '50%',
//                 animation: `floatingParticles 4s linear infinite ${i * 0.3}s`,
//                 filter: 'drop-shadow(0 0 3px #67e8f9)',
//               }}
//             />
//           ))}
//         </div>

//         {/* Loading text */}
//         <div className="mt-8 text-center">
//           <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
//                style={{
//                  animation: 'textGlow 2s ease-in-out infinite alternate',
//                  filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))',
//                }}>
//             LOADING
//           </div>
//           <div className="flex justify-center mt-3 space-x-1">
//             {[...Array(3)].map((_, i) => (
//               <div
//                 key={i}
//                 className="w-2 h-2 bg-cyan-400 rounded-full"
//                 style={{
//                   animation: `dotPulse 1.5s ease-in-out infinite ${i * 0.2}s`,
//                   filter: 'drop-shadow(0 0 4px #22d3ee)',
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Background electric field effect */}
//         <div className="absolute inset-0 -z-10 opacity-30">
//           {[...Array(20)].map((_, i) => (
//             <div
//               key={`bg-${i}`}
//               className="absolute w-px h-20 bg-gradient-to-t from-transparent via-cyan-300 to-transparent"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 animation: `backgroundSpark 3s linear infinite ${Math.random() * 3}s`,
//                 transform: `rotate(${Math.random() * 360}deg)`,
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes electricSpin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         @keyframes electricPulse {
//           0% { transform: scale(1); opacity: 0.8; }
//           100% { transform: scale(1.1); opacity: 1; }
//         }

//         @keyframes innerGlow {
//           0% { opacity: 0.6; transform: scale(0.9); }
//           100% { opacity: 1; transform: scale(1); }
//         }

//         @keyframes electricSpark {
//           0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--rotation)) scale(0); }
//           10% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation)) scale(1); }
//           90% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation)) scale(1); }
//           100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--rotation)) scale(0); }
//         }

//         @keyframes floatingParticles {
//           0% { 
//             transform: translate(-50%, -50%) rotate(0deg) translateX(60px) rotate(0deg);
//             opacity: 0;
//           }
//           10% { opacity: 1; }
//           90% { opacity: 1; }
//           100% { 
//             transform: translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg);
//             opacity: 0;
//           }
//         }

//         @keyframes textGlow {
//           0% { opacity: 0.8; }
//           100% { opacity: 1; }
//         }

//         @keyframes dotPulse {
//           0%, 100% { transform: scale(1); opacity: 0.7; }
//           50% { transform: scale(1.3); opacity: 1; }
//         }

//         @keyframes backgroundSpark {
//           0% { opacity: 0; transform: scaleY(0); }
//           50% { opacity: 0.3; transform: scaleY(1); }
//           100% { opacity: 0; transform: scaleY(0); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ElectricLoader;

import React from 'react';

const ElectricLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      <div className="relative">
        {/* Hexagon layers */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${120 - i * 20}px`,
                height: `${120 - i * 20}px`,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: `linear-gradient(${i * 90}deg, 
                  rgba(236, 72, 153, ${0.8 - i * 0.15}), 
                  rgba(59, 130, 246, ${0.8 - i * 0.15}), 
                  rgba(34, 197, 94, ${0.8 - i * 0.15}))`,
                animation: `hexagonSpin ${2 + i * 0.5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                filter: `drop-shadow(0 0 ${20 - i * 3}px rgba(236, 72, 153, 0.5))`,
              }}
            />
          ))}
          
          {/* Center core */}
          <div className="absolute w-8 h-8 bg-white rounded-full"
               style={{
                 animation: 'centerGlow 1.5s ease-in-out infinite alternate',
                 filter: 'drop-shadow(0 0 15px #ffffff)',
               }}>
          </div>
          
          {/* Corner lights */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`corner-${i}`}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: `hsl(${i * 60}, 80%, 60%)`,
                left: '50%',
                top: '50%',
                transformOrigin: '0 0',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`,
                animation: `cornerPulse 2s ease-in-out infinite ${i * 0.3}s`,
                filter: `drop-shadow(0 0 8px hsl(${i * 60}, 80%, 60%))`,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="mt-8 text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            LOADING
          </div>
          <div className="mt-2 text-pink-300/70">Neon Hexagon</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes hexagonSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes centerGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes cornerPulse {
          0%, 100% { 
            opacity: 0.6; 
            transform: translate(-50%, -50%) rotate(${props => props.rotation || 0}deg) translateY(-60px) scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) rotate(${props => props.rotation || 0}deg) translateY(-60px) scale(1.5); 
          }
        }
      `}</style>
    </div>
  );
};

export default ElectricLoader;