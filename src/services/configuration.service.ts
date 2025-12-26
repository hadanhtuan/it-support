import { Collection } from '@/lib/core/models';
import { AdminConfiguration } from '@/lib/core/models/configuration.model';
import { FirestoreClientHelper } from '@/lib/firebase/client/firestore-client.helper';

interface IConfigurationService {
  COLLECTION_NAME: Collection;
  DOC_ID: string;
  getConfiguration(): Promise<AdminConfiguration>;
  saveConfiguration(config: AdminConfiguration): Promise<void>;
}

export const configurationService = ((): IConfigurationService => {
  const customConfigurationService: IConfigurationService = {
    COLLECTION_NAME: Collection.CONFIGURATIONS,
    DOC_ID: 'admin-config',
    async getConfiguration(): Promise<AdminConfiguration> {
      try {
        const config = await FirestoreClientHelper.getItemById<AdminConfiguration>(this.COLLECTION_NAME, this.DOC_ID);

        if (!config) {
          // Return default empty configuration if none exists
          return { majors: [] };
        }

        return config;
      } catch (error) {
        console.error('Error fetching configuration:', error);
        throw new Error('Failed to fetch configuration');
      }
    },

    async saveConfiguration(config: AdminConfiguration): Promise<void> {
      try {
        await FirestoreClientHelper.createDocument(this.COLLECTION_NAME, config, this.DOC_ID);
      } catch (error) {
        console.error('Error saving configuration:', error);
        throw new Error('Failed to save configuration');
      }
    }
  };

  return customConfigurationService;
})();
