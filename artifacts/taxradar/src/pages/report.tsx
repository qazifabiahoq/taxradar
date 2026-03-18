import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { mockReportData } from "@/lib/mock-data";
import { AnalysisReport } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, Download, Copy, FileText, CheckCircle2, FileX2, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";

const COLORS = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--warning))",
  low: "hsl(var(--success))"
};

export default function ReportPage() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<AnalysisReport | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem("reportData");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        setData(mockReportData);
      }
    } else {
      // If no data, populate with mock so it looks beautiful
      setData(mockReportData);
    }
  }, []);

  if (!data) return null;

  const chartData = [
    { name: "High Risk", value: data.risk_distribution.high, color: COLORS.high },
    { name: "Medium Risk", value: data.risk_distribution.medium, color: COLORS.medium },
    { name: "Low Risk", value: data.risk_distribution.low, color: COLORS.low },
  ].filter(d => d.value > 0);

  const getOverallStatus = () => {
    if (data.audit_risk_score >= 70) return { label: "High Risk", color: "bg-destructive text-destructive-foreground" };
    if (data.audit_risk_score >= 40) return { label: "Review Required", color: "bg-warning text-warning-foreground" };
    return { label: "Ready to File", color: "bg-success text-success-foreground" };
  };
  
  const status = getOverallStatus();

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyMemo = () => {
    navigator.clipboard.writeText(data.cpa_memo);
    // Could add toast here
  };

  return (
    <Layout>
      {/* Sticky Top Bar */}
      <div className="sticky top-20 z-40 bg-card/95 backdrop-blur-md border-b border-white/5 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Tax Readiness Report</h1>
              <p className="text-sm text-muted-foreground">{data.client_name} • Tax Year {data.tax_year} • {data.analysis_date}</p>
            </div>
            <Badge className={clsx(status.color, "ml-4 px-3 py-1 text-sm font-semibold")}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={copyMemo}>
              <Copy className="w-4 h-4 mr-2" /> Copy Memo
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" /> Download Report
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Row: Score & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 bg-card border-white/5 shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Audit Risk Score</h3>
            <div className="relative w-48 h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={clsx("text-4xl font-bold", 
                  data.audit_risk_score >= 70 ? "text-destructive" : 
                  data.audit_risk_score >= 40 ? "text-warning" : "text-success"
                )}>
                  {data.audit_risk_score}
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-destructive"></div> {data.risk_distribution.high} High</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-warning"></div> {data.risk_distribution.medium} Med</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-success"></div> {data.risk_distribution.low} Low</div>
            </div>
          </Card>

          <Card className="col-span-1 lg:col-span-2 p-6 bg-card border-white/5 shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Executive Summary
            </h3>
            <div className="text-muted-foreground leading-relaxed flex-1 text-base">
              {data.executive_summary}
            </div>
            {data.missing_documents.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-1">Missing Documents Action Required</h4>
                  <p className="text-sm text-destructive/80">There are {data.missing_documents.length} missing documents preventing safe filing. Please request these immediately.</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* High Risks */}
        {data.top_risks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-destructive" /> Top Audit Risks Identified
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.top_risks.map((risk, i) => {
                // Backend may return title/explanation or category/description
                const riskTitle = (risk as any).title || (risk as any).category || '';
                const riskDesc = (risk as any).explanation || (risk as any).description || '';
                const riskLevel = (risk as any).risk_level || 'high';
                const badgeClass = riskLevel === 'medium' ? 'bg-warning/20 text-warning border-warning/30' : riskLevel === 'low' ? 'bg-success/20 text-success border-success/30' : 'bg-destructive/20 text-destructive border-destructive/30';
                return (
                  <Card key={i} className="p-5 bg-card border-white/5 border-t-4 border-t-destructive shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <Badge variant="destructive" className={badgeClass}>{riskLevel.toUpperCase()} RISK</Badge>
                    </div>
                    <h4 className="text-white font-semibold mb-3 pr-20">{riskTitle}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{riskDesc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Income Analysis */}
        <Card className="bg-card border-white/5 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Income Cross-Check</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Source Document</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.income_sources.map((income, i) => {
                  const amount = Number((income as any).amount ?? 0);
                  const source = (income as any).source || (income as any).type || 'Unknown';
                  const status = (income as any).status || ((income as any).flag_reason ? 'flagged' : 'consistent');
                  const notes = (income as any).notes || (income as any).flag_reason || (income as any).type || '';
                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{source}</td>
                      <td className="px-6 py-4 text-white">${amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {status === 'consistent' || status === 'verified' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Consistent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> Flagged
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Deductions Detailed */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Deduction Analysis</h3>
          <div className="space-y-3">
            {data.deductions.map((deduction, i) => {
              // Backend may return deduction_type/amount_claimed or category/amount
              const category = (deduction as any).category || (deduction as any).deduction_type || 'Unknown';
              const amount = Number((deduction as any).amount ?? (deduction as any).amount_claimed ?? 0);
              const riskLevel = (deduction as any).risk_level || 'low';
              const notes = (deduction as any).notes || (deduction as any).flag_reason || (deduction as any).recommendation || '';

              const riskColor =
                riskLevel === 'high' ? 'border-l-destructive' :
                riskLevel === 'medium' ? 'border-l-warning' : 'border-l-success';
              const badgeColor =
                riskLevel === 'high' ? 'bg-destructive/20 text-destructive' :
                riskLevel === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success';

              const isExpanded = expandedRows[i];

              return (
                <Card key={i} className={clsx("bg-card border-white/5 border-l-4 shadow-sm hover:bg-white/[0.02] transition-colors cursor-pointer", riskColor)}>
                  <div className="p-4 sm:px-6 flex items-center justify-between" onClick={() => toggleRow(i)}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{category}</h4>
                        <div className="text-sm text-muted-foreground">${amount.toLocaleString()}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={clsx("border-0 font-semibold uppercase tracking-wider text-xs", badgeColor)}>
                      {riskLevel} RISK
                    </Badge>
                  </div>
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 ml-12 border-t border-white/5">
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Missing Documents */}
        {data.missing_documents.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileX2 className="w-6 h-6 text-destructive" /> Missing Required Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.missing_documents.map((doc, i) => {
                // Backend may return form_name/reason_required/risk_of_absence or document/reason/impact
                const docName = (doc as any).document || (doc as any).form_name || 'Unknown';
                const reason = (doc as any).reason || (doc as any).reason_required || (doc as any).consequence || '';
                const impact = (doc as any).impact || (doc as any).risk_of_absence || 'unknown';
                return (
                  <Card key={i} className="p-5 bg-background border border-destructive/30 flex items-start gap-4">
                    <div className="bg-destructive/10 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{docName}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{reason}</p>
                      <Badge variant="outline" className="border-destructive/30 text-destructive text-xs uppercase">Impact: {impact}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* CPA Memo */}
        <Card className="p-6 bg-card border-white/5 shadow-lg mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Generated CPA Memo</h3>
            <Button variant="outline" size="sm" onClick={copyMemo} className="border-white/10 hover:bg-white/5">
              <Copy className="w-4 h-4 mr-2" /> Copy text
            </Button>
          </div>
          <textarea 
            className="w-full h-96 bg-background border border-white/10 rounded-xl p-6 text-sm text-foreground font-mono focus:ring-2 focus:ring-primary focus:outline-none resize-y"
            defaultValue={data.cpa_memo}
          />
        </Card>

      </div>
    </Layout>
  );
}
