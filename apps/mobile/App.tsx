import React from 'react';
import { TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import config from './tamagui.config';

const queryClient = new QueryClient();

/**
 * Main App component
 */
function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme="dark">
        {/* Navigation will be added in later steps */}
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

export default App;
