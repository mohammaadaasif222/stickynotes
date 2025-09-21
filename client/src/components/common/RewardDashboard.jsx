import React, { useState } from "react";
import {
  Users,
  TrendingUp,
  Target,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Award,
  BarChart3,
} from "lucide-react";
import { useUserRewards } from "../../hooks/useUserReward";

const RewardDashboard = () => {
   const { rewards, bussiness, dashboard, stats, loading, error } = useUserRewards();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [activeTab, setActiveTab] = useState("overview");


  // console.log("Rewards:", rewards);
  console.log("Business:", bussiness);

  // Sample data
  const data = {
    directBusiness: 300,
    teamBusiness: 601,
    personalBusiness: 500,
    totalBusiness: 1101,
    teamLevels: {
      1: {
        business: 300,
        members: 3,
        activeMemberBusiness: 300,
      },
      2: {
        business: 301,
        members: 2,
        activeMemberBusiness: 301,
      },
      3: {
        business: 0,
        members: 1,
        activeMemberBusiness: 0,
      },
    },
    memberCount: 6,
    legBusiness: {
      legs: {
        leg_1: {
          ratio: 50,
          business: 401,
          members: [19, 21],
          weightedBusiness: 200.5,
        },
        leg_2: {
          ratio: 50,
          business: 200,
          members: [22],
          weightedBusiness: 100,
        },
      },
      totalLegBusiness: 601,
      ratios: [50, 50],
      distributionMode: "auto",
    },
    nestedStructure: [
      {
        user_id: 19,
        parent_id: 18,
        level: 2,
        path: "/18/19/",
        direct_referrals: 1,
        total_team_size: 1,
        active_team_size: 1,
        team_business: "0.00",
        depth: "1",
        children: [
          {
            user_id: 20,
            parent_id: 19,
            level: 3,
            path: "/18/19/20/",
            direct_referrals: 0,
            total_team_size: 0,
            active_team_size: 0,
            team_business: "0.00",
            depth: "2",
            children: [],
          },
        ],
      },
      {
        user_id: 21,
        parent_id: 18,
        level: 2,
        path: "/18/21/",
        direct_referrals: 0,
        total_team_size: 0,
        active_team_size: 0,
        team_business: "0.00",
        depth: "1",
        children: [],
      },
      {
        user_id: 22,
        parent_id: 18,
        level: 2,
        path: "/18/22/",
        direct_referrals: 1,
        total_team_size: 2,
        active_team_size: 1,
        team_business: "0.00",
        depth: "1",
        children: [
          {
            user_id: 23,
            parent_id: 22,
            level: 3,
            path: "/18/22/23/",
            direct_referrals: 1,
            total_team_size: 1,
            active_team_size: 0,
            team_business: "0.00",
            depth: "2",
            children: [
              {
                user_id: 24,
                parent_id: 23,
                level: 4,
                path: "/18/22/23/24/",
                direct_referrals: 0,
                total_team_size: 0,
                active_team_size: 0,
                team_business: "0.00",
                depth: "3",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const toggleNode = (userId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text", "bg")
            .replace("-600", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const TreeNode = ({ node, depth = 0 }) => {
    const isExpanded = expandedNodes.has(node.user_id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="ml-4">
        <div
          className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
            depth === 0
              ? "bg-blue-50 border border-blue-200"
              : depth === 1
              ? "bg-green-50 border border-green-200"
              : "bg-gray-50 border border-gray-200"
          } hover:shadow-md`}
          onClick={() => hasChildren && toggleNode(node.user_id)}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )
            ) : (
              <div className="w-4 h-4 mr-2" />
            )}

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                depth === 0
                  ? "bg-blue-500"
                  : depth === 1
                  ? "bg-green-500"
                  : "bg-purple-500"
              }`}
            >
              {node.user_id}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-800">
                  User {node.user_id}
                </span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                  Level {node.level}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Depth {node.depth}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Direct: {node.direct_referrals} | Team: {node.total_team_size} |
                Active: {node.active_team_size}
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-green-600">
                {formatCurrency(parseFloat(node.team_business))}
              </div>
              <div className="text-xs text-gray-500">Team Business</div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4">
            {node.children.map((child) => (
              <TreeNode key={child.user_id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const LegCard = ({ legName, legData }) => (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-800 capitalize">
          {legName.replace("_", " ")}
        </h3>
        <div className="text-2xl font-bold text-purple-600">
          {legData.ratio}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Business Volume</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(legData.business)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Weighted Business</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(legData.weightedBusiness)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Members</span>
          <span className="font-semibold text-blue-600">
            {legData.members.length}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">Member IDs</div>
          <div className="flex flex-wrap gap-1">
            {legData.members.map((memberId) => (
              <span
                key={memberId}
                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
              >
                {memberId}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Business Dashboard
          </h1>
          <p className="text-gray-600">
            Track your network performance and growth
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Business"
            value={formatCurrency(data.totalBusiness)}
            icon={DollarSign}
            color="text-green-600"
            subtitle="All revenue streams"
          />
          <StatCard
            title="Team Business"
            value={formatCurrency(data.teamBusiness)}
            icon={TrendingUp}
            color="text-blue-600"
            subtitle="Team generated revenue"
          />
          <StatCard
            title="Personal Business"
            value={formatCurrency(data.personalBusiness)}
            icon={Target}
            color="text-purple-600"
            subtitle="Direct sales"
          />
          <StatCard
            title="Team Members"
            value={data.memberCount}
            icon={Users}
            color="text-indigo-600"
            subtitle="Total network size"
          />
        </div>

        {/* Tab Navigation */}
        {/* <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'levels', label: 'Team Levels', icon: Award },
            { id: 'legs', label: 'Leg Analysis', icon: TrendingUp },
            { id: 'structure', label: 'Network Tree', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div> */}

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Direct Business</h3>
                  <p className="text-3xl font-bold">{formatCurrency(data.directBusiness)}</p>
                  <p className="text-green-100 text-sm mt-2">Personal sales volume</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Team Business</h3>
                  <p className="text-3xl font-bold">{formatCurrency(data.teamBusiness)}</p>
                  <p className="text-blue-100 text-sm mt-2">Team generated volume</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
                  <p className="text-3xl font-bold">+12.5%</p>
                  <p className="text-purple-100 text-sm mt-2">Month over month</p>
                </div>
              </div>
            </div>
          )} */}

          {/* {activeTab === 'levels' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Level Analysis</h2>
              
              <div className="space-y-4">
                {Object.entries(data.teamLevels).map(([level, levelData]) => (
                  <div key={level} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">Level {level}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {levelData.members} Members
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-gray-600 text-sm">Total Business</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(levelData.business)}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-gray-600 text-sm">Active Business</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(levelData.activeMemberBusiness)}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="text-gray-600 text-sm">Avg per Member</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(levelData.business / levelData.members)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Leg Business Analysis
            </h2>

            <div className={`grid grid-cols-1 md:grid-cols-${Object.entries(data.legBusiness.legs).length} gap-6 mb-6`}>
              {Object.entries(data.legBusiness.legs).map(
                ([legName, legData]) => (
                  <LegCard key={legName} legName={legName} legData={legData} />
                )
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Total Leg Business</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(data.legBusiness.totalLegBusiness)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Distribution Mode</p>
                  <p className="text-xl font-bold text-blue-600 capitalize">
                    {data.legBusiness.distributionMode}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Balance Ratio</p>
                  <p className="text-xl font-bold text-purple-600">
                    {data.legBusiness.ratios.join(":")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* {activeTab === 'structure' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Network Structure</h2>
                <button
                  onClick={() => setExpandedNodes(new Set())}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Collapse All
                </button>
              </div>
              
              <div className="space-y-2">
                {data.nestedStructure.map((node) => (
                  <TreeNode key={node.user_id} node={node} />
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;
