
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

const enrichedExampleData = `STAR-L ID,Role,Company,Year,Situation,Task,Action,Result,Learning,Tier,Link to Project Docs,Score,Tags
SL001,Software Engineer,TechCorp,2023,Legacy system causing performance issues,Modernize architecture,Led migration to microservices,50% performance improvement,Modern architecture principles,3,,85,Software Development;System Architecture;Performance
SL002,Product Manager,StartupInc,2022,User retention dropping by 30%,Identify and fix retention issues,Conducted user research and A/B testing,Increased retention by 40%,Data-driven product decisions,2,,78,Product Management;User Research;Data Analysis
SL003,Data Scientist,BigData Ltd,2023,Manual reporting taking 40 hours/week,Automate reporting pipeline,Built ML-powered dashboard,Reduced time to 2 hours/week,Automation saves significant time,3,,92,Data Science;Machine Learning;Automation
SL004,DevOps Engineer,CloudFirst,2021,Deployment failures at 15% rate,Reduce deployment failure rate,Implemented CI/CD with automated testing,Reduced failures to 2%,Proper testing prevents failures,2,,88,DevOps;CI/CD;Quality Assurance
SL005,UX Designer,DesignStudio,2022,User complaints about confusing navigation,Improve user experience,Redesigned information architecture,User satisfaction up 60%,User-centered design principles,2,,82,UX Design;User Research;Information Architecture
SL006,Engineering Manager,TechGiant,2023,Team missing sprint goals consistently,Improve team velocity and planning,Implemented agile best practices,Sprint success rate improved to 95%,Proper planning and communication,3,,90,Team Management;Agile;Process Improvement
SL007,Marketing Manager,RetailCorp,2022,Campaign ROI declining quarter over quarter,Optimize marketing spend,Implemented attribution modeling,ROI increased by 150%,Data-driven marketing decisions,2,,86,Marketing;Data Analysis;ROI Optimization
SL008,Sales Engineer,SaaSVendor,2023,Deal size decreasing and sales cycle lengthening,Improve sales process and deal quality,Created technical sales playbooks,Average deal size up 40%,Technical expertise accelerates sales,2,,79,Sales;Technical Communication;Process Development
SL009,QA Engineer,MobileApp Co,2021,Bug escape rate to production at 12%,Reduce production bugs,Implemented shift-left testing strategy,Bug escape rate reduced to 3%,Early testing catches more issues,2,,84,Quality Assurance;Testing Strategy;Process Improvement
SL010,Backend Engineer,FinTech Inc,2023,API response times averaging 2+ seconds,Optimize API performance,Implemented caching and database optimization,Response times reduced to 200ms average,Performance optimization techniques,3,,91,Backend Development;Performance;Database Optimization
SL011,Frontend Engineer,WebDev Agency,2022,Mobile conversion rate 40% lower than desktop,Improve mobile user experience,Redesigned mobile interface with progressive enhancement,Mobile conversion increased by 65%,Mobile-first design principles,2,,87,Frontend Development;Mobile Design;Conversion Optimization
SL012,Scrum Master,AgileTeam,2023,Team velocity declining for 3 sprints,Identify and remove impediments,Facilitated retrospectives and process improvements,Velocity increased by 30%,Continuous improvement mindset,2,,76,Agile;Team Facilitation;Process Improvement
SL013,Security Engineer,CyberSec Corp,2022,Security incident response time averaging 4 hours,Reduce incident response time,Automated threat detection and response,Response time reduced to 30 minutes,Automation improves security response,3,,93,Security;Incident Response;Automation
SL014,Data Engineer,Analytics Co,2023,Data pipeline failing 20% of the time,Improve pipeline reliability,Implemented monitoring and error handling,Pipeline reliability improved to 99.5%,Robust error handling and monitoring,2,,89,Data Engineering;Pipeline Architecture;Monitoring
SL015,Technical Writer,DocuTech,2022,Developer onboarding taking 2 weeks,Reduce onboarding time,Created interactive documentation and tutorials,Onboarding reduced to 3 days,Clear documentation accelerates learning,1,,72,Technical Writing;Documentation;Developer Experience
SL016,Cloud Architect,CloudNative Inc,2023,Infrastructure costs increasing 25% monthly,Optimize cloud spend,Implemented cost monitoring and right-sizing,Reduced costs by 40%,Cloud cost optimization strategies,3,,94,Cloud Architecture;Cost Optimization;Infrastructure
SL017,Mobile Developer,AppStudio,2021,App store rating dropping to 2.8 stars,Improve app quality and user experience,Fixed critical bugs and improved UX,Rating improved to 4.6 stars,User feedback drives improvement,2,,81,Mobile Development;User Experience;Quality Improvement
SL018,AI/ML Engineer,AITech,2023,Model accuracy at 72% not meeting requirements,Improve model performance,Implemented feature engineering and ensemble methods,Accuracy improved to 89%,Feature engineering is crucial,3,,95,Machine Learning;Feature Engineering;Model Optimization
SL019,Site Reliability Engineer,WebScale,2022,System uptime at 97% below SLA,Improve system reliability,Implemented chaos engineering and redundancy,Uptime improved to 99.9%,Proactive reliability engineering,3,,92,SRE;System Reliability;Chaos Engineering
SL020,Business Analyst,CorpSolutions,2023,Requirements gathering taking 6 weeks per project,Streamline requirements process,Created templates and facilitation frameworks,Requirements gathering reduced to 2 weeks,Structured processes improve efficiency,1,,75,Business Analysis;Requirements Gathering;Process Improvement
SL021,Integration Engineer,ConnectAll,2022,Integration failures causing daily production issues,Stabilize integration layer,Implemented circuit breakers and retry logic,Integration failures reduced by 95%,Resilient integration patterns,2,,88,Integration;System Design;Resilience Patterns
SL022,Performance Engineer,SpeedTech,2023,Application load time at 8 seconds,Optimize application performance,Implemented performance monitoring and optimization,Load time reduced to 1.2 seconds,Performance monitoring guides optimization,3,,90,Performance Engineering;Monitoring;Optimization
SL023,Release Manager,DeployFast,2021,Release cycle taking 6 weeks,Accelerate release process,Implemented automated deployment pipeline,Release cycle reduced to 2 weeks,Automation accelerates delivery,2,,83,Release Management;Deployment Automation;Process Optimization
SL024,Technical Lead,InnovateNow,2023,Code quality issues causing 30% of bugs,Improve code quality,Implemented code review process and static analysis,Bug rate reduced by 70%,Code quality practices prevent issues,2,,87,Technical Leadership;Code Quality;Process Implementation
SL025,Infrastructure Engineer,BuildIt,2022,Server provisioning taking 3 days,Automate infrastructure provisioning,Implemented Infrastructure as Code,Provisioning reduced to 30 minutes,Infrastructure automation saves time,2,,86,Infrastructure;Automation;DevOps
SL026,API Developer,ServiceMesh,2023,API documentation outdated and incomplete,Improve API documentation,Implemented automated API documentation,Developer adoption increased by 200%,Good documentation drives adoption,1,,74,API Development;Documentation;Developer Experience
SL027,Test Automation Engineer,QualityFirst,2022,Manual testing taking 40 hours per release,Automate testing process,Built comprehensive test automation framework,Testing time reduced to 4 hours,Test automation improves efficiency,2,,85,Test Automation;Quality Assurance;Process Improvement
SL028,Platform Engineer,PlatformTech,2023,Developer productivity declining due to tooling,Improve developer experience,Built internal developer platform,Developer velocity increased by 50%,Good tooling improves productivity,3,,91,Platform Engineering;Developer Experience;Tooling
SL029,Database Administrator,DataCore,2021,Database performance degrading under load,Optimize database performance,Implemented indexing and query optimization,Query performance improved by 400%,Database optimization techniques,2,,88,Database Administration;Performance Tuning;Optimization
SL030,Network Engineer,NetSecure,2023,Network latency causing user complaints,Reduce network latency,Optimized routing and implemented CDN,Latency reduced by 60%,Network optimization improves user experience,2,,82,Network Engineering;Performance;Infrastructure
SL031,Solutions Architect,EnterpriseTech,2022,System integration complexity increasing costs,Simplify integration architecture,Designed microservices architecture with API gateway,Integration costs reduced by 45%,Simple architectures reduce complexity,3,,93,Solutions Architecture;System Integration;Microservices
SL032,Cybersecurity Analyst,SecureNet,2023,Security alerts overwhelming team,Optimize security monitoring,Implemented AI-based threat detection,False positives reduced by 80%,AI improves security efficiency,2,,89,Cybersecurity;Threat Detection;Process Optimization
SL033,DevSecOps Engineer,SecureDev,2022,Security vulnerabilities found late in cycle,Shift security left in development,Integrated security scanning in CI/CD pipeline,Vulnerabilities caught 90% earlier,Early security integration prevents issues,3,,94,DevSecOps;Security;CI/CD Integration
SL034,Systems Engineer,SystemsInc,2023,System monitoring blind spots causing outages,Improve system observability,Implemented comprehensive monitoring and alerting,Mean time to detection reduced by 85%,Observability prevents outages,2,,87,Systems Engineering;Monitoring;Observability
SL035,Software Architect,ArchitectureFirm,2021,Monolithic application limiting scalability,Design scalable architecture,Migrated to event-driven microservices,System can now handle 10x load,Event-driven architecture enables scale,3,,96,Software Architecture;Scalability;Event-Driven Design
SL036,Technical Consultant,ConsultCorp,2023,Client systems integration taking 6 months,Accelerate integration delivery,Created reusable integration framework,Integration time reduced to 6 weeks,Reusable frameworks accelerate delivery,2,,84,Technical Consulting;Integration;Framework Development
SL037,Automation Engineer,AutoTech,2022,Manual processes consuming 60% of team time,Automate repetitive processes,Built workflow automation platform,Manual work reduced by 80%,Automation frees teams for value work,2,,88,Automation;Process Improvement;Workflow Design
SL038,Cloud Developer,CloudNative,2023,Cloud costs spiraling out of control,Implement cost governance,Built cost monitoring and automated rightsizing,Costs reduced by 50% while improving performance,Cost governance enables sustainable growth,3,,92,Cloud Development;Cost Management;Governance
SL039,Reliability Engineer,ReliableSystem,2022,Mean time to recovery at 4 hours,Reduce system recovery time,Implemented automated failover and recovery,MTTR reduced to 15 minutes,Automation improves recovery times,3,,95,Reliability Engineering;Disaster Recovery;Automation
SL040,Integration Specialist,ConnectPro,2023,Data synchronization errors affecting business,Ensure data consistency,Implemented event sourcing and CQRS pattern,Data consistency issues eliminated,Event sourcing ensures data integrity,3,,91,Data Integration;Event Sourcing;System Design
SL041,Performance Analyst,SpeedAnalytics,2021,Application bottlenecks unclear,Identify performance bottlenecks,Implemented APM and distributed tracing,Identified and resolved 15 bottlenecks,Observability reveals performance issues,2,,86,Performance Analysis;APM;Distributed Tracing
SL042,Build Engineer,BuildMaster,2023,Build times taking 45 minutes,Reduce build times,Implemented distributed build system,Build times reduced to 5 minutes,Parallel builds improve efficiency,2,,83,Build Engineering;CI/CD;Performance Optimization
SL043,Technical Product Manager,ProductTech,2022,Feature adoption rate at 15%,Increase feature adoption,Implemented feature analytics and user feedback,Adoption rate increased to 75%,Data-driven feature development,2,,79,Product Management;Analytics;User Experience
SL044,Configuration Management,ConfigControl,2023,Configuration drift causing production issues,Eliminate configuration drift,Implemented GitOps and configuration as code,Configuration drift eliminated,GitOps ensures configuration consistency,2,,87,Configuration Management;GitOps;Infrastructure as Code
SL045,Monitoring Engineer,MonitorAll,2022,Alert fatigue reducing response effectiveness,Optimize alerting strategy,Implemented intelligent alerting with ML,False alerts reduced by 90%,Smart alerting improves response quality,3,,90,Monitoring;Machine Learning;Alert Management
SL046,Service Mesh Engineer,MeshTech,2023,Service communication causing latency,Optimize service mesh performance,Implemented optimized service mesh configuration,Service latency reduced by 50%,Service mesh optimization improves performance,3,,94,Service Mesh;Performance;Microservices
SL047,Container Engineer,ContainerCorp,2021,Container orchestration complexity,Simplify container management,Implemented standardized Kubernetes patterns,Deployment complexity reduced significantly,Standards simplify operations,2,,85,Containerization;Kubernetes;Standardization
SL048,Event Streaming Engineer,StreamData,2023,Data processing lag affecting real-time features,Reduce data processing latency,Optimized event streaming architecture,Processing latency reduced by 80%,Stream processing optimization techniques,3,,93,Event Streaming;Real-time Processing;Performance
SL049,API Gateway Engineer,GatewayTech,2022,API management overhead slowing development,Streamline API lifecycle,Implemented automated API governance,API deployment time reduced by 70%,Automation streamlines API management,2,,88,API Management;Automation;Governance
SL050,Compliance Engineer,CompliTech,2023,Compliance audits taking 3 months,Accelerate compliance processes,Automated compliance monitoring and reporting,Audit preparation reduced to 2 weeks,Automation enables continuous compliance,2,,84,Compliance;Automation;Governance
SL051,Disaster Recovery Specialist,DisasterPrep,2022,RTO at 8 hours not meeting business needs,Improve disaster recovery capabilities,Designed automated DR with hot standby,RTO reduced to 15 minutes,Automation enables fast recovery,3,,96,Disaster Recovery;Business Continuity;Automation
SL052,Capacity Planning Engineer,CapacityPro,2023,Resource utilization at 90% causing instability,Optimize resource utilization,Implemented predictive capacity planning,Utilization optimized to 70% with better performance,Predictive planning prevents bottlenecks,2,,89,Capacity Planning;Resource Management;Predictive Analytics
SL053,Service Delivery Manager,DeliverService,2021,Service delivery SLA at 85%,Improve service delivery performance,Implemented service management automation,SLA improved to 99%,Process automation improves service delivery,2,,81,Service Management;Process Automation;SLA Management
SL054,Technical Evangelist,EvangelTech,2023,Developer community engagement low,Increase developer engagement,Created comprehensive developer experience program,Developer engagement increased by 300%,Good developer experience drives adoption,1,,77,Developer Relations;Community Building;Technical Communication
SL055,Edge Computing Engineer,EdgeTech,2022,Edge deployment complexity limiting rollouts,Simplify edge deployments,Built automated edge deployment framework,Edge deployment time reduced by 85%,Automation enables edge scalability,3,,92,Edge Computing;Deployment Automation;Scalability
SL056,Workflow Engineer,WorkflowPro,2023,Business process automation failing 25% of time,Improve workflow reliability,Implemented robust error handling and monitoring,Workflow success rate improved to 99%,Robust design improves reliability,2,,86,Workflow Automation;Process Design;Reliability
SL057,Data Platform Engineer,DataPlatform,2022,Data scientists waiting 2 weeks for environments,Accelerate data science workflows,Built self-service data science platform,Environment provisioning reduced to 5 minutes,Self-service platforms improve productivity,3,,91,Data Platform;Self-Service;Developer Experience
SL058,Serverless Engineer,ServerlessTech,2023,Cold start latency affecting user experience,Optimize serverless performance,Implemented warming strategies and optimization,Cold start latency reduced by 70%,Serverless optimization techniques,2,,88,Serverless;Performance Optimization;User Experience
SL059,GitOps Engineer,GitOpsPro,2021,Deployment consistency issues across environments,Ensure deployment consistency,Implemented GitOps with environment promotion,Deployment consistency achieved across all environments,GitOps ensures consistent deployments,3,,94,GitOps;Deployment;Configuration Management
SL060,Observability Engineer,ObserveTech,2023,Troubleshooting incidents taking 3+ hours,Reduce incident resolution time,Implemented unified observability platform,Incident resolution time reduced to 20 minutes,Observability accelerates troubleshooting,3,,95,Observability;Incident Management;Performance Monitoring`;

interface ImportStats {
  imported: number;
  updated: number;
  errors: string[];
}

interface StoryImportProps {
  onImportComplete?: (stats: {imported: number; updated: number}) => void;
}

export const StoryImport: React.FC<StoryImportProps> = ({ onImportComplete }) => {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Parse headers from first line
    const headerLine = lines[0];
    const headers = parseCSVRow(headerLine);
    
    // Parse data rows
    const rows = lines.slice(1);
    return rows.map(row => {
      const values = parseCSVRow(row);
      const story: any = {};
      
      headers.forEach((header, index) => {
        story[header] = values[index] || '';
      });
      
      return story;
    });
  };

  // Quote-aware CSV parser that handles commas inside quoted fields
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // Handle escaped quotes ("")
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const mapCSVToStory = (csvRow: any) => {
    // Extract year from ranges like "2019–2021" or single years
    const parseYear = (yearStr: string): number | null => {
      if (!yearStr) return null;
      const match = yearStr.match(/(\d{4})/);
      return match ? parseInt(match[1]) : null;
    };

    // Parse numeric fields safely
    const parseNumber = (str: string): number | null => {
      if (!str || str.trim() === '') return null;
      const num = parseInt(str.trim());
      return isNaN(num) ? null : num;
    };

    // Map CSV fields to database fields
    const story = {
      star_l_id: csvRow['STAR-L ID']?.trim() || null,
      role: csvRow['Role']?.trim() || null,
      organisation: csvRow['Company']?.trim() || null,
      year: parseYear(csvRow['Year']),
      situation: csvRow['Situation']?.trim() || null,
      task: csvRow['Task']?.trim() || null,
      action: csvRow['Action']?.trim() || null,
      result: csvRow['Result']?.trim() || null,
      lesson: csvRow['Learning']?.trim() || null,
      tier: parseNumber(csvRow['Tier']) || 1,
      external_docs_url: csvRow['Link to Project Docs']?.trim() || null,
      score: parseNumber(csvRow['Score']),
      theme: csvRow['Role']?.trim() || 'Professional', // Use role as theme
      framing: 'Professional', // Default framing
      user_id: user?.id || null
    };

    // Parse tags, handling semicolon-separated values
    const tagsStr = csvRow['Tags']?.trim();
    const tags = tagsStr ? tagsStr.split(';').map((t: string) => t.trim()).filter(Boolean) : [];
    
    return { story, tags };
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV data to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    const stats: ImportStats = { imported: 0, updated: 0, errors: [] };

    try {
      const csvRows = parseCSV(csvData);
      
      for (const csvRow of csvRows) {
        try {
          const { story, tags } = mapCSVToStory(csvRow);
          
          if (!story.star_l_id) {
            stats.errors.push(`Missing STAR-L ID for story: ${story.situation?.substring(0, 50)}...`);
            continue;
          }

          // Upsert story - handle dev mode with null user_id
          let query = supabase
            .from('interview_stories')
            .select('id')
            .eq('star_l_id', story.star_l_id);
          
          if (story.user_id) {
            query = query.eq('user_id', story.user_id);
          } else {
            query = query.is('user_id', null);
          }
          
          const { data: existingStory, error: fetchError } = await query.maybeSingle();

          if (fetchError) {
            stats.errors.push(`Error checking existing story ${story.star_l_id}: ${fetchError.message}`);
            continue;
          }

          let storyId: string;
          
          if (existingStory) {
            // Update existing story
            const { data: updatedStory, error: updateError } = await supabase
              .from('interview_stories')
              .update(story)
              .eq('id', existingStory.id)
              .select('id')
              .single();

            if (updateError) {
              stats.errors.push(`Error updating story ${story.star_l_id}: ${updateError.message}`);
              continue;
            }
            
            storyId = updatedStory.id;
            stats.updated++;
          } else {
            // Insert new story
            const { data: newStory, error: insertError } = await supabase
              .from('interview_stories')
              .insert(story)
              .select('id')
              .single();

            if (insertError) {
              stats.errors.push(`Error inserting story ${story.star_l_id}: ${insertError.message}`);
              continue;
            }
            
            storyId = newStory.id;
            stats.imported++;
          }

          // Handle tags - gracefully handle RLS failures
          if (tags.length > 0) {
            try {
              // Delete existing tags for this story
              await supabase
                .from('story_tags')
                .delete()
                .eq('story_id', storyId);

              // Insert new tags
              const tagInserts = tags.map(tag => ({
                story_id: storyId,
                tag: tag,
                tag_type: 'label'
              }));

              const { error: tagsError } = await supabase
                .from('story_tags')
                .insert(tagInserts);

              if (tagsError) {
                // Fallback: store tags in ai_suggestions as JSON
                await supabase
                  .from('interview_stories')
                  .update({ 
                    ai_suggestions: { tags: tags, _fallback_reason: 'RLS_blocked_tags' }
                  })
                  .eq('id', storyId);
              }
            } catch (tagError) {
              // Silent fallback - tags will be stored in ai_suggestions
              await supabase
                .from('interview_stories')
                .update({ 
                  ai_suggestions: { tags: tags, _fallback_reason: 'tags_insert_failed' }
                })
                .eq('id', storyId);
            }
          }

        } catch (error) {
          stats.errors.push(`Error processing row: ${error}`);
        }
      }

      setImportStats(stats);
      
      // Notify parent component
      onImportComplete?.({
        imported: stats.imported,
        updated: stats.updated
      });
      
      toast({
        title: "Import Complete",
        description: `Imported ${stats.imported} new stories, updated ${stats.updated} existing stories`,
      });

    } catch (error) {
      toast({
        title: "Import Failed",
        description: `Error: ${error}`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import STAR-L Stories
        </CardTitle>
        <CardDescription>
          Paste CSV data to import or update your STAR-L stories. Format: STAR-L ID,Role,Company,Year,Situation,Task,Action,Result,Learning,Tags,Tier,Link to Project Docs,Score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">CSV Data</label>
            <Button 
              onClick={() => setCsvData(enrichedExampleData)}
              variant="outline"
              size="sm"
            >
              Load 60 Enriched Examples
            </Button>
          </div>
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        
        <Button 
          onClick={handleImport} 
          disabled={isImporting || !csvData.trim()}
          className="w-full"
        >
          {isImporting ? (
            <>
              <FileText className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Stories
            </>
          )}
        </Button>

        {importStats && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Import Complete:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Imported: {importStats.imported} new stories</li>
                  <li>Updated: {importStats.updated} existing stories</li>
                  {importStats.errors.length > 0 && (
                    <li>Errors: {importStats.errors.length}</li>
                  )}
                </ul>
                {importStats.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Errors</summary>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {importStats.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
