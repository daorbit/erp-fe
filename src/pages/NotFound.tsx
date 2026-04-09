import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#111318]">
      <Result
        status="404"
        title="404"
        subTitle="The page you are looking for does not exist or has been moved."
        extra={
          <Link to="/admin">
            <Button type="primary" icon={<HomeOutlined />} size="large">Go Home</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
