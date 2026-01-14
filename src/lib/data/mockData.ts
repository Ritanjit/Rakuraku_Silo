import type { Applicant, StatCardData, ChartData } from '../types';

export const statCards: StatCardData[] = [
    {
        title: 'Total Applications',
        count: 1842,
        trendPct: 15,
        trendColor: 'green',
        icon: 'chart-bar'
    },
    {
        title: 'Application Withdrawn',
        count: 250,
        trendPct: 68,
        trendColor: 'green',
        icon: 'arrow-trending-down'
    },
    {
        title: 'Application Approved',
        count: 1444,
        trendPct: -62,
        trendColor: 'red',
        icon: 'check-circle'
    },
    {
        title: 'Application Rejected',
        count: 24,
        trendPct: 11,
        trendColor: 'blue',
        icon: 'x-circle'
    }
];

export const barChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Applications',
            data: [4800, 3200, 4500, 2800, 4200, 3500, 2900, 2600, 4600, 3400, 2800, 0],
            backgroundColor: '#16a34a',
            borderColor: '#15803d',
            borderWidth: 1
        }
    ]
};

export const pieChartData: ChartData = {
    labels: ['Approved', 'Rejected', 'Withdrawn'],
    datasets: [
        {
            label: 'Application Status',
            data: [68, 12, 22],
            backgroundColor: ['#22c55e', '#ef4444', '#f97316'],
            // borderColor: ['#16a34a', '#dc2626', '#ea580c'],
            borderWidth: 2
        }
    ]
};

export const applicants: Applicant[] = [
    {
        id: '1',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Approved',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '2',
        name: 'Aditi Menon',
        academyLocation: 'Tezpur',
        applicationStatus: 'Rejected',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '3',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Approved',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '4',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Approved',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '5',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Pending',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '6',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Rejected',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '7',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Approved',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    },
    {
        id: '8',
        name: 'Aditi Menon',
        academyLocation: 'Guwahati',
        applicationStatus: 'Approved',
        applicationDate: '14 Mar 2008',
        program: 'B.Tech',
        dateOfBirth: '14 Mar 2008',
        gender: 'Female'
    }
];