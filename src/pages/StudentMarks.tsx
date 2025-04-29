
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const StudentMarks = () => {
  const { user } = useAuth();
  const { getStudentCourses, getStudentMarks } = useData();

  const studentId = user?.id;
  
  if (!studentId) {
    return <div>Loading student data...</div>;
  }

  const courses = getStudentCourses(studentId);
  const marks = getStudentMarks(studentId);

  // Prepare marks data
  const marksData = courses.map(course => {
    const mark = marks.find(m => m.courseCode === course.code);
    const marksObtained = mark ? mark.marks : 0;
    const maxMarks = 60;
    const percentage = (marksObtained / maxMarks) * 100;
    
    // Grade calculation
    let grade = "";
    if (percentage >= 90) grade = "S";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "F";

    return {
      course,
      marksObtained,
      maxMarks,
      percentage,
      grade,
      color: getColorByPercentage(percentage)
    };
  });

  // Prepare chart data
  const chartData = marksData.map(data => ({
    name: data.course.code,
    value: data.marksObtained,
    percentage: data.percentage,
    color: data.color
  }));

  // Calculate overall performance
  const totalMarks = marksData.reduce((sum, data) => sum + data.marksObtained, 0);
  const maxPossibleMarks = marksData.reduce((sum, data) => sum + data.maxMarks, 0);
  const overallPercentage = (totalMarks / maxPossibleMarks) * 100;

  // Distribution data for pie chart
  const gradeDistribution = [
    { name: "Excellent (90-100%)", count: marksData.filter(d => d.percentage >= 90).length },
    { name: "Very Good (80-89%)", count: marksData.filter(d => d.percentage >= 80 && d.percentage < 90).length },
    { name: "Good (70-79%)", count: marksData.filter(d => d.percentage >= 70 && d.percentage < 80).length },
    { name: "Average (60-69%)", count: marksData.filter(d => d.percentage >= 60 && d.percentage < 70).length },
    { name: "Below Average (50-59%)", count: marksData.filter(d => d.percentage >= 50 && d.percentage < 60).length },
    { name: "Fail (Below 50%)", count: marksData.filter(d => d.percentage < 50).length }
  ].filter(d => d.count > 0);

  const COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#6b7280"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Internal Marks Report</h2>
        <p className="text-muted-foreground">
          View your internal assessment marks for all enrolled courses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>
              Your overall performance across all courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-60">
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
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value}/${props.payload.maxMarks} (${props.payload.percentage.toFixed(1)}%)`,
                      props.payload.course.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Overall Score: {totalMarks}/{maxPossibleMarks}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span>Overall Percentage</span>
                <span>{overallPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={overallPercentage} 
                className="bg-primary/10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>
              Distribution of your grades across courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, count, percent }) => 
                      `${count} course${count !== 1 ? 's' : ''} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => [`${value} course${value !== 1 ? 's' : ''}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Course Marks</CardTitle>
          <CardDescription>
            Your internal marks for each enrolled course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marksData.map((data) => (
              <div key={data.course.code} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{data.course.code} - {data.course.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Marks: {data.marksObtained}/{data.maxMarks} ({data.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="text-sm font-medium px-2.5 py-0.5 rounded-full" 
                    style={{ 
                      backgroundColor: `${data.color}20`, 
                      color: data.color 
                    }}>
                    Grade: {data.grade}
                  </div>
                </div>
                <Progress 
                  value={data.percentage} 
                  className="bg-primary/10"
                  indicatorClassName={`bg-[${data.color}]`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get color based on percentage
function getColorByPercentage(percentage: number): string {
  if (percentage >= 90) return "#22c55e"; // Green
  if (percentage >= 80) return "#84cc16"; // Light green
  if (percentage >= 70) return "#eab308"; // Yellow
  if (percentage >= 60) return "#f97316"; // Orange
  if (percentage >= 50) return "#ef4444"; // Red
  return "#6b7280"; // Gray
}

export default StudentMarks;
